package ru.ddc.gateway.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class SecurityMappingConfig {

    @Bean
    public GrantedAuthoritiesMapper userAuthoritiesMapper() {
        return (authorities) -> {
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();

            authorities.forEach(authority -> {
                if (authority instanceof OidcUserAuthority oidcAuthority) {
                    var idToken = oidcAuthority.getIdToken();

                    Map<String, Object> realmAccess = idToken.getClaim("realm_access");
                    if (realmAccess != null && realmAccess.get("roles") instanceof List<?> roles) {
                        roles.forEach(role -> mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                    }

                    Map<String, Object> resourceAccess = idToken.getClaim("resource_access");
                    if (resourceAccess != null && resourceAccess.get("gateway") instanceof Map<?, ?> clientAccess) {
                        if (clientAccess.get("roles") instanceof List<?> roles) {
                            roles.forEach(role -> mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                        }
                    }
                }
            });

            return mappedAuthorities;
        };
    }
}
