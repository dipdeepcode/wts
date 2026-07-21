package ru.ddc.tasksservice.domain.repository;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .map(auth -> {
                    // Если это OAuth2/JWT (стандарт для Resource Server)
                    if (auth.getPrincipal() instanceof Jwt jwt) {
                        return jwt.getClaimAsString("sub"); // или другой клейм
                    }
                    return auth.getName();
                });
    }
}
