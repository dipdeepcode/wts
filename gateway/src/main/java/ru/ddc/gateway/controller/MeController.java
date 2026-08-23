package ru.ddc.gateway.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/bff")
public class MeController {

    @GetMapping("/me")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OidcUser oidcUser) {

        return Map.of(
                "username", Objects.requireNonNull(oidcUser.getPreferredUsername()),
                "email", Objects.requireNonNull(oidcUser.getEmail()),
                "roles", oidcUser.getAuthorities(),
                "exp", Objects.requireNonNull(oidcUser.getExpiresAt()).getEpochSecond()
        );
    }

}
