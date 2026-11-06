package com.haltcharge.controller;

import com.haltcharge.dto.SessionDto;
import com.haltcharge.security.CustomUserDetails;
import com.haltcharge.service.ChargingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/charging-sessions")
public class ChargingSessionController {

    private final ChargingSessionService sessionService;

    public ChargingSessionController(ChargingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<SessionDto.SessionResponse> startSession(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody SessionDto.StartSessionRequest request) {
        return ResponseEntity.ok(sessionService.startSession(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<SessionDto.SessionResponse>> getMySessions(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(sessionService.getUserSessions(user.getId()));
    }

    @GetMapping("/active")
    public ResponseEntity<SessionDto.SessionResponse> getActiveSession(
            @AuthenticationPrincipal CustomUserDetails user) {
        SessionDto.SessionResponse active = sessionService.getActiveSessionForUser(user.getId());
        return active != null ? ResponseEntity.ok(active) : ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionDto.SessionResponse> getSessionById(
            @PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<SessionDto.SessionResponse> stopSession(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "STOPPED_BY_USER") String reason) {
        return ResponseEntity.ok(sessionService.stopSession(user.getId(), id, reason));
    }
}

