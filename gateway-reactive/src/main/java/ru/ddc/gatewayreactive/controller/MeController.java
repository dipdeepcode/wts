package ru.ddc.gatewayreactive.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/bff")
public class MeController {
    private static final Logger logger = LoggerFactory.getLogger(MeController.class);

    @GetMapping("/me")
    public Mono<Map<String, Object>> getUserInfo(@AuthenticationPrincipal OidcUser oidcUser) {
        return Mono.justOrEmpty(oidcUser)
                .doOnNext(user -> logger.info("Raw ID Token (JWT): {}", user.getIdToken().getTokenValue()))
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("username", Objects.toString(user.getPreferredUsername(), ""));
                    map.put("email", Objects.toString(user.getEmail(), ""));
                    map.put("roles", user.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .toList());
                    return map;
                });
    }

}
