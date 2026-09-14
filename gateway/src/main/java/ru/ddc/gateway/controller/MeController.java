package ru.ddc.gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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

        Map<String, Object> map = new HashMap<>();
        map.put("username", Objects.toString(oidcUser.getPreferredUsername(), ""));
        map.put("email", Objects.toString(oidcUser.getEmail(), ""));

        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_LOG_LEVEL:WRITE"))) {
            map.put("can_change_logging_level", true);
            map.put("current_logging_level", Objects.toString(oidcUser.getIdToken().getClaimAsString("logging_level"), "default"));
        }

        return map;

    }

}
