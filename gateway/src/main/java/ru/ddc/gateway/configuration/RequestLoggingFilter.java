package ru.ddc.gateway.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter implements WebFilter {
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (!"/healthcheck".equals(path)) {
            // 1. Логируем входящий запрос
            logger.info("Request: {} {}", path, request.getMethod());
            request.getHeaders().forEach((headerName, headerValues) ->
                    logger.info("Request header: {} = {}", headerName, String.join(", ", headerValues))
            );

            // 2. Регистрируем коллбэк для логирования ответа перед тем, как он запишется в сеть
            exchange.getResponse().beforeCommit(() -> {
                ServerHttpResponse response = exchange.getResponse();
                logger.info("Response Status: {}", response.getStatusCode());
                response.getHeaders().forEach((headerName, headerValues) ->
                        logger.info("Response header: {} = {}", headerName, String.join(", ", headerValues))
                );
                return Mono.empty();
            });
        }

        return chain.filter(exchange);
    }
}

