package ru.ddc.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
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

    private final OAuth2AuthorizedClientService authorizedClientService;

    public MeController(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    @GetMapping("/me")
    public Map<String, Object> getUserInfo(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken) || !(authentication.getPrincipal() instanceof OidcUser oidcUser)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken.getName()
        );

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
