package com.haltcharge.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "platform", "Halt & Charge EV Charging Platform API",
                "version", "1.0.0",
                "status", "ONLINE",
                "timestamp", OffsetDateTime.now(),
                "endpoints", Map.of(
                        "swaggerUi", "/swagger-ui/index.html",
                        "apiDocs", "/v3/api-docs",
                        "health", "/actuator/health",
                        "stations", "/api/stations",
                        "auth", "/api/auth/login"
                )
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "message", "Halt & Charge backend is fully operational"));
    }
}
