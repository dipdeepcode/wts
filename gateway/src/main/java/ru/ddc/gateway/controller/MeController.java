package ru.ddc.gateway.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;

@RestController
public class MeController {

    @GetMapping("/api/me")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OidcUser oidcUser) {
        if (oidcUser == null) {
            return Map.of("error", "Unauthorized");
        }

        Long expiresAtSeconds = oidcUser.getExpiresAt() != null
                ? oidcUser.getExpiresAt().getEpochSecond()
                : null;

        return Map.of(
                "username", Objects.requireNonNull(oidcUser.getPreferredUsername()),
                "email", Objects.requireNonNull(oidcUser.getEmail()),
                "roles", oidcUser.getAuthorities(),
                "exp", Objects.requireNonNull(expiresAtSeconds)
        );
    }

    @GetMapping("/me")
    public Map<String, Object> getUserInfo2(@AuthenticationPrincipal OidcUser oidcUser) {
        if (oidcUser == null) {
            return Map.of("error", "Unauthorized");
        }

        Long expiresAtSeconds = oidcUser.getExpiresAt() != null
                ? oidcUser.getExpiresAt().getEpochSecond()
                : null;

        return Map.of(
                "username", Objects.requireNonNull(oidcUser.getPreferredUsername()),
                "email", Objects.requireNonNull(oidcUser.getEmail()),
                "roles", oidcUser.getAuthorities(),
                "exp", Objects.requireNonNull(expiresAtSeconds)
        );
    }

}
