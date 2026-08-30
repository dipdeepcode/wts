package ru.ddc.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.core.OAuth2AuthorizationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/bff")
public class MeController {
    private final OAuth2AuthorizedClientManager authorizedClientManager;
    private static final Logger logger = LoggerFactory.getLogger(MeController.class);


    public MeController(OAuth2AuthorizedClientManager authorizedClientManager) {
        this.authorizedClientManager = authorizedClientManager;
    }

    @GetMapping("/me")
    public Map<String, Object> getUserInfo(Authentication authentication,
                                           HttpServletRequest request,
                                           HttpServletResponse response) {

        if (authentication == null || !(authentication.getPrincipal() instanceof OidcUser oidcUser)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        String rawIdToken = oidcUser.getIdToken().getTokenValue();
        logger.info("Raw ID Token (JWT): {}", rawIdToken);

        OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                .withClientRegistrationId("keycloak")
                .principal(authentication)
                .attribute(HttpServletRequest.class.getName(), request)
                .attribute(HttpServletResponse.class.getName(), response)
                .build();

        OAuth2AuthorizedClient authorizedClient;
        try {
            authorizedClient = authorizedClientManager.authorize(authorizeRequest);

            if (authorizedClient == null) {
                handleLocalLogout(request, response, authentication);
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization context missing");
            }

        } catch (OAuth2AuthorizationException ex) {
            handleLocalLogout(request, response, authentication);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired in Identity Provider", ex);
        }

        long exp = Objects.requireNonNull(authorizedClient.getAccessToken().getExpiresAt()).getEpochSecond();

        Map<String, Object> realmAccess = oidcUser.getIdToken().getClaim("realm_access");
        List<String> roles = new ArrayList<>();

        if (realmAccess != null && realmAccess.get("roles") instanceof Collection<?> rawRoles) {
            roles = rawRoles.stream()
                    .map(Object::toString)
                    .toList();
        }

        return Map.of(
                "username", Objects.requireNonNull(oidcUser.getPreferredUsername()),
                "email", Objects.requireNonNull(oidcUser.getEmail()),
                "roles", roles,
                "exp", exp
        );

    }

    private void handleLocalLogout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
        logoutHandler.setClearAuthentication(true);
        logoutHandler.setInvalidateHttpSession(true);
        logoutHandler.logout(request, response, authentication);
    }

}
