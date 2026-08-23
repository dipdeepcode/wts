package ru.ddc.gateway.controller;

import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/bff")
public class LoginOptionsController {
    private final InMemoryClientRegistrationRepository clientRegistrationRepository;

    public LoginOptionsController(InMemoryClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @GetMapping("/login-options")
    public LoginOption getLoginOptions() {
        return StreamSupport.stream(clientRegistrationRepository.spliterator(), false)
                .filter(registration -> "keycloak".equals(registration.getRegistrationId()))
                .map(this::buildLoginOption)
                .findFirst()
                .orElse(new LoginOption("", "", ""));
    }

    private LoginOption buildLoginOption(ClientRegistration registration) {
        String label = registration.getClientName();
        String loginUri = "/oauth2/authorization/" + registration.getRegistrationId();
        String accountConsoleUrl = "";

        String issuerUri = (String) registration.getProviderDetails().getConfigurationMetadata().get("issuer");

        if (issuerUri == null) {
            issuerUri = registration.getProviderDetails().getIssuerUri();
        }

        if (issuerUri != null) {
            accountConsoleUrl = issuerUri.replaceAll("/$", "") + "/account";
        }

        return new LoginOption(label, loginUri, accountConsoleUrl);
    }

}
