package ru.ddc.gateway.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

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

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)
                || !(authentication.getPrincipal() instanceof OidcUser oidcUser)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                .withClientRegistrationId(oauthToken.getAuthorizedClientRegistrationId())
                .principal(oauthToken)
                .attribute(HttpServletRequest.class.getName(), request)
                .attribute(HttpServletResponse.class.getName(), response)
                .build();

        OAuth2AuthorizedClient client = authorizedClientManager.authorize(authorizeRequest);

        long expiresAt;
        if (client != null && client.getAccessToken() != null && client.getAccessToken().getExpiresAt() != null) {
            expiresAt = client.getAccessToken().getExpiresAt().getEpochSecond();
        } else {
            expiresAt = oidcUser.getExpiresAt().getEpochSecond();
        }

        return Map.of(
                "username", oidcUser.getPreferredUsername(),
                "email", oidcUser.getEmail(),
                "roles", authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList(),
                "exp", expiresAt
        );
    }
}
