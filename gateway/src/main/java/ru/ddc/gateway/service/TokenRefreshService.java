package ru.ddc.gateway.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TokenRefreshService {

    private final OAuth2AuthorizedClientManager authorizedClientManager;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private static final Logger log = LoggerFactory.getLogger(TokenRefreshService.class);

    public TokenRefreshService(OAuth2AuthorizedClientManager authorizedClientManager,
                               OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientManager = authorizedClientManager;
        this.authorizedClientService = authorizedClientService;
    }

    public void forceTokenRefresh(Authentication authentication, String loggingLevel) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new IllegalStateException("User is not authenticated via OAuth2");
        }

        String clientRegistrationId = oauthToken.getAuthorizedClientRegistrationId();
        String principalName = oauthToken.getName();

        // 1. Извлекаем текущий авторизованный клиент из базы/сессии
        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                clientRegistrationId, principalName);

        if (authorizedClient == null || authorizedClient.getRefreshToken() == null) {
            throw new IllegalStateException("No refresh token available for this session");
        }

        // 2. Хак: Ложно состариваем Access Token, чтобы менеджер посчитал его просроченным
        OAuth2AccessToken expiredAccessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                authorizedClient.getAccessToken().getTokenValue(),
                Instant.now().minusSeconds(3600), // выставляем прошедшее время
                Instant.now().minusSeconds(1800),
                authorizedClient.getAccessToken().getScopes()
        );

        // Создаем модифицированный клиент с "протухшим" токеном
        OAuth2AuthorizedClient expiredClient = new OAuth2AuthorizedClient(
                authorizedClient.getClientRegistration(),
                authorizedClient.getPrincipalName(),
                expiredAccessToken,
                authorizedClient.getRefreshToken()
        );
        log.info("expiredClient: {}", expiredClient.toString());

        // 3. Формируем запрос на авторизацию. Менеджер увидит expired токен и пойдет в Keycloak за новым
        OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                .withAuthorizedClient(expiredClient)
                .principal(authentication)
                .attribute("logging_level", loggingLevel)
                .build();
        log.info("authorizeRequest: {}", authorizeRequest.toString());

        // Этот вызов выполнит HTTP-запрос к Keycloak /token эндпоинту с grant_type=refresh_token
        OAuth2AuthorizedClient refreshedClient = authorizedClientManager.authorize(authorizeRequest);
        log.info("refreshedClient: {}", refreshedClient.toString());

        if (refreshedClient != null) {
            log.info("Raw ID Token (JWT): {}", refreshedClient.getAccessToken().getTokenValue());
            // 4. Сохраняем обновленные токены обратно в Spring Session JDBC
            authorizedClientService.saveAuthorizedClient(refreshedClient, authentication);
        } else {
            throw new RuntimeException("Failed to refresh token via Keycloak");
        }
    }
}
