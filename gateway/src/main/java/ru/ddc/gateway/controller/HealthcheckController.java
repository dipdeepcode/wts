package ru.ddc.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.Map;

@RestController
public class HealthcheckController {

    @GetMapping("/healthcheck")
    public Mono<ResponseEntity<Map<String, String>>> getHealth() {
        return Mono.just(ResponseEntity.ok(Collections.singletonMap("status", "UP")));
    }
}
