package ru.ddc.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/bff")
public class MeController {
    private final OAuth2AuthorizedClientManager authorizedClientManager;

    public MeController(OAuth2AuthorizedClientManager authorizedClientManager) {
        this.authorizedClientManager = authorizedClientManager;
    }

    @GetMapping("/me")
    public Map<String, Object> getUserInfo(Authentication authentication,
                                           HttpServletRequest request,
                                           HttpServletResponse response) {

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();

        OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                .withClientRegistrationId("keycloak")
                .principal(authentication)
                .attribute(HttpServletRequest.class.getName(), request)
                .attribute(HttpServletResponse.class.getName(), response)
                .build();

        OAuth2AuthorizedClient authorizedClient = authorizedClientManager.authorize(authorizeRequest);

        long exp = (authorizedClient != null)
                ? Objects.requireNonNull(authorizedClient.getAccessToken().getExpiresAt()).getEpochSecond()
                : Objects.requireNonNull(oidcUser.getExpiresAt()).getEpochSecond();

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Map.of(
                "username", Objects.requireNonNull(oidcUser.getPreferredUsername()),
                "email", Objects.requireNonNull(oidcUser.getEmail()),
                "roles", roles,
                "exp", exp
        );

    }

}
