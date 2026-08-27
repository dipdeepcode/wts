package ru.ddc.tasksservice.configuration;

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
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!"/healthcheck".equals(request.getRequestURI())) {
            logger.info("Request: {} {}", request.getRequestURI(), request.getMethod());
            Collections.list(request.getHeaderNames()).forEach(headerName ->
                    logger.info("Request header: {} = {}", headerName, request.getHeader(headerName))
            );
            try {
                filterChain.doFilter(request, response);
            } finally {
                logger.info("Response Status: {}", response.getStatus());
                response.getHeaderNames().forEach(headerName ->
                        logger.info("Response header: {} = {}", headerName, response.getHeader(headerName))
                );
            }
        } else {
            filterChain.doFilter(request, response);
        }

    }
}