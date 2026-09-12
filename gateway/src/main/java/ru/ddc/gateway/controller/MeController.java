package ru.ddc.gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/bff")
public class MeController {
    private static final Logger logger = LoggerFactory.getLogger(MeController.class);

    @GetMapping("/me")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OidcUser oidcUser,
                                           Authentication authentication) {

        var rawIdToken = oidcUser.getIdToken().getTokenValue();
        logger.info("Raw ID Token (JWT): {}", rawIdToken);

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Map.of(
                "username", Objects.toString(oidcUser.getPreferredUsername(), ""),
                "email", Objects.toString(oidcUser.getEmail(), ""),
                "roles", roles
        );

    }

}
