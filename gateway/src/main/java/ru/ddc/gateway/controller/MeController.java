package ru.ddc.gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OidcUser oidcUser) {

        var rawIdToken = oidcUser.getIdToken().getTokenValue();
        logger.info("Raw ID Token (JWT): {}", rawIdToken);

        var roles = oidcUser.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        logger.info("Roles: {}", roles);

        return Map.of(
                "username", oidcUser.getPreferredUsername(),
                "email", oidcUser.getEmail(),
                "roles", roles,
                "exp", oidcUser.getExpiresAt().getEpochSecond()
        );

    }

}
