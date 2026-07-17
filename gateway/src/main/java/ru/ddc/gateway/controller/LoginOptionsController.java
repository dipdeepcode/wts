package ru.ddc.gateway.controller;

import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.StreamSupport;

@RestController
public class LoginOptionsController {
    private final InMemoryClientRegistrationRepository clientRegistrationRepository;

    public LoginOptionsController(InMemoryClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @GetMapping("/login-options")
    public LoginOption getLoginOptions() {
        // Преобразуем Iterable в Stream и мапим в наш DTO
        return StreamSupport.stream(clientRegistrationRepository.spliterator(), false)
                .filter(registration -> "keycloak".equals(registration.getRegistrationId()))
                .map(registration -> new LoginOption(
                        registration.getClientName(),
                        "/oauth2/authorization/" + registration.getRegistrationId()
                ))
                .findFirst()
                .orElse(new LoginOption("", ""));
    }
}
