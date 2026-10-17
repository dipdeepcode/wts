package ru.ddc.gateway.configuration;

import com.c4_soft.springaddons.security.oidc.starter.reactive.client.ClientAuthorizeExchangeSpecPostProcessor;
import com.c4_soft.springaddons.security.oidc.starter.reactive.client.ClientReactiveHttpSecurityPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class WebSecurityConfig {

    @Bean
    ClientReactiveHttpSecurityPostProcessor clientReactiveHttpSecurityPostProcessor() {
        return (serverHttpSecurity) -> serverHttpSecurity
                .csrf(csrf -> csrf.requireCsrfProtectionMatcher(
                        new NegatedServerWebExchangeMatcher(
                                ServerWebExchangeMatchers.pathMatchers("/otel/**")
                        )
                ));
    }

    @Bean
    ClientAuthorizeExchangeSpecPostProcessor clientAuthorizeExchangeSpecPostProcessor() {
        return (registry) -> registry
                .pathMatchers("/otel/**").hasAuthority("ROLE_DEBUGGER")
                .anyExchange().authenticated();
    }
}

