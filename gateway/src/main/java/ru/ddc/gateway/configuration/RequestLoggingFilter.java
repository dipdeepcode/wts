package ru.ddc.gateway.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Ставит фильтр самым первым в цепочке
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Логируем входящий запрос
        logger.info("Request: {} {}", request.getRequestURI(), request.getMethod());

        Collections.list(request.getHeaderNames()).forEach(headerName ->
                logger.info("Request header: {} = {}", headerName, request.getHeader(headerName))
        );

        try {
            // Передаем запрос дальше по цепочке
            filterChain.doFilter(request, response);
        } finally {
            // Логируем ответ после того, как он вернулся из контроллеров/сервлетов
            logger.info("Response Status: {}", response.getStatus());
            response.getHeaderNames().forEach(headerName ->
                    logger.info("Response header: {} = {}", headerName, response.getHeader(headerName))
            );
        }
    }
}
