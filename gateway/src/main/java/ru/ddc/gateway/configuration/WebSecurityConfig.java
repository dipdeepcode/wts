package ru.ddc.gateway.configuration;

import com.c4_soft.springaddons.security.oidc.starter.synchronised.client.ClientExpressionInterceptUrlRegistryPostProcessor;
import com.c4_soft.springaddons.security.oidc.starter.synchronised.client.ClientSynchronizedHttpSecurityPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Bean
    ClientSynchronizedHttpSecurityPostProcessor clientSynchronizedHttpSecurityPostProcessor() {
        return (http) -> http.csrf(csrf -> csrf.ignoringRequestMatchers("/otel/**"));
    }

    @Bean
    ClientExpressionInterceptUrlRegistryPostProcessor clientExpressionInterceptUrlRegistryPostProcessor() {
        return (registry) -> registry
                .requestMatchers("/otel/**").hasAuthority("ROLE_DEBUGGER")
                .anyRequest().authenticated();
    }
}
