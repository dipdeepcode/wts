package ru.ddc.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ddc.gateway.service.TokenRefreshService;

import java.util.Map;

@RestController
@RequestMapping("/bff/logging-level")
public class LoggingLevelController {
    private final TokenRefreshService tokenRefreshService;

    public LoggingLevelController(TokenRefreshService tokenRefreshService) {
        this.tokenRefreshService = tokenRefreshService;
    }

    @PostMapping("/change")
    @PreAuthorize("hasRole('LOG_LEVEL:WRITE')")
    public ResponseEntity<Map<String, String>> changeLoggingLevel(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String newLevel = request.get("level");
        if (newLevel == null || (!newLevel.equals("INFO") && !newLevel.equals("TRACE") && !newLevel.equals("DEBUG"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid logging level"));
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String userId = oauthToken.getPrincipal().getAttribute("sub");

        try {
            tokenRefreshService.forceTokenRefresh(authentication, newLevel);
            return ResponseEntity.ok(Map.of("status", "success", "current_level", newLevel));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to cycle token: " + e.getMessage()));
        }
    }
}
