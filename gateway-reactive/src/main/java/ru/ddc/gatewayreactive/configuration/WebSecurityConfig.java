package ru.ddc.gatewayreactive.configuration;

import com.c4_soft.springaddons.security.oidc.starter.reactive.client.ClientAuthorizeExchangeSpecPostProcessor;
import com.c4_soft.springaddons.security.oidc.starter.reactive.client.ClientReactiveHttpSecurityPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.server.csrf.CsrfWebFilter;
import org.springframework.security.web.server.util.matcher.AndServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;

@Configuration
public class WebSecurityConfig {

    @Bean
    ClientReactiveHttpSecurityPostProcessor clientReactiveHttpSecurityPostProcessor() {
        return (http) -> http.csrf(csrf -> csrf.requireCsrfProtectionMatcher(new AndServerWebExchangeMatcher(
                CsrfWebFilter.DEFAULT_CSRF_MATCHER,
                new NegatedServerWebExchangeMatcher(ServerWebExchangeMatchers.pathMatchers("/otel/**")))));
    }

    @Bean
    ClientAuthorizeExchangeSpecPostProcessor clientAuthorizeExchangeSpecPostProcessor() {
        return (registry) -> registry
                .pathMatchers("/otel/**").hasAuthority("ROLE_DEBUGGER")
                .anyExchange().authenticated();
    }
}
