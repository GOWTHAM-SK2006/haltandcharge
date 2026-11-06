package com.haltcharge.controller;

import com.haltcharge.dto.AdminStatsDto;
import com.haltcharge.dto.ChargerDto;
import com.haltcharge.dto.SessionDto;
import com.haltcharge.dto.StationDto;
import com.haltcharge.entity.Charger;
import com.haltcharge.entity.Station;
import com.haltcharge.entity.User;
import com.haltcharge.exception.ResourceNotFoundException;
import com.haltcharge.repository.*;
import com.haltcharge.service.ChargingSessionService;
import com.haltcharge.service.StationService;
import com.haltcharge.simulator.ChargerCommunicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final ChargingSessionRepository sessionRepository;
    private final StationService stationService;
    private final ChargingSessionService sessionService;
    private final ChargerCommunicationService simulatorService;
    private final SimulatorEventRepository eventRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserRepository userRepository,
                           StationRepository stationRepository,
                           ChargerRepository chargerRepository,
                           ChargingSessionRepository sessionRepository,
                           StationService stationService,
                           ChargingSessionService sessionService,
                           ChargerCommunicationService simulatorService,
                           SimulatorEventRepository eventRepository,
                           AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.sessionRepository = sessionRepository;
        this.stationService = stationService;
        this.sessionService = sessionService;
        this.simulatorService = simulatorService;
        this.eventRepository = eventRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // 1. Dashboard Metrics
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalStations(stationRepository.count());
        stats.setTotalChargers(chargerRepository.count());
        stats.setAvailableChargers(chargerRepository.countByStatus("AVAILABLE"));
        stats.setChargingChargers(chargerRepository.countByStatus("CHARGING"));
        stats.setOfflineChargers(chargerRepository.countByStatus("OFFLINE"));
        stats.setFaultedChargers(chargerRepository.countByStatus("FAULTED"));
        stats.setActiveSessions(sessionRepository.countByStatus("IN_PROGRESS"));
        stats.setCompletedSessions(sessionRepository.countByStatus("COMPLETED"));
        stats.setSimulatedEnergyKwh(sessionRepository.sumSimulatedEnergy());
        stats.setSimulatedRevenue(sessionRepository.sumSimulatedRevenue());
        return ResponseEntity.ok(stats);
    }

    // 2. Station Management
    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getAllStations() {
        return ResponseEntity.ok(stationRepository.findAllAdmin());
    }

    @PostMapping("/stations")
    public ResponseEntity<Station> createStation(@RequestBody StationDto.CreateStationRequest req) {
        return ResponseEntity.ok(stationService.createStation(req));
    }

    @PutMapping("/stations/{id}")
    public ResponseEntity<Station> updateStation(@PathVariable Long id, @RequestBody StationDto.CreateStationRequest req) {
        return ResponseEntity.ok(stationService.updateStation(id, req));
    }

    @DeleteMapping("/stations/{id}")
    public ResponseEntity<Void> deactivateStation(@PathVariable Long id) {
        stationService.deactivateStation(id);
        return ResponseEntity.noContent().build();
    }

    // 3. Charger Management
    @GetMapping("/chargers")
    public ResponseEntity<List<Charger>> getAllChargers() {
        return ResponseEntity.ok(chargerRepository.findAllAdmin());
    }

    @PostMapping("/chargers")
    public ResponseEntity<Charger> createCharger(@RequestBody ChargerDto.CreateChargerRequest req) {
        Charger c = new Charger();
        c.setStationId(req.getStationId());
        c.setIdentifier(req.getIdentifier());
        c.setName(req.getName());
        c.setChargerType(req.getChargerType());
        c.setMaxPowerKw(req.getMaxPowerKw());
        c.setTariffPerKwh(req.getTariffPerKwh());
        c.setStatus("AVAILABLE");
        c.setIsSimulated(req.getIsSimulated() != null ? req.getIsSimulated() : true);
        c.setIsActive(true);
        return ResponseEntity.ok(chargerRepository.save(c));
    }

    @PutMapping("/chargers/{id}")
    public ResponseEntity<Charger> updateCharger(@PathVariable Long id, @RequestBody ChargerDto.CreateChargerRequest req) {
        Charger c = chargerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found: " + id));
        c.setStationId(req.getStationId());
        c.setIdentifier(req.getIdentifier());
        c.setName(req.getName());
        c.setChargerType(req.getChargerType());
        c.setMaxPowerKw(req.getMaxPowerKw());
        c.setTariffPerKwh(req.getTariffPerKwh());
        return ResponseEntity.ok(chargerRepository.save(c));
    }

    // 4. User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        User u = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        u.setStatus(status.toUpperCase());
        userRepository.save(u);
        u.setPasswordHash(null);
        return ResponseEntity.ok(u);
    }

    // 5. Sessions Management
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDto.SessionResponse>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    // 6. Simulator Hardware Control APIs
    @PostMapping("/simulator/chargers/{id}/offline")
    public ResponseEntity<Map<String, String>> simulateOffline(@PathVariable Long id) {
        simulatorService.setChargerOffline(id);
        return ResponseEntity.ok(Map.of("message", "Simulated charger " + id + " state: OFFLINE"));
    }

    @PostMapping("/simulator/chargers/{id}/fault")
    public ResponseEntity<Map<String, String>> simulateFault(@PathVariable Long id, @RequestParam(defaultValue = "Hardware ground fault detected") String reason) {
        simulatorService.setChargerFault(id, reason);
        return ResponseEntity.ok(Map.of("message", "Simulated charger " + id + " state: FAULTED (" + reason + ")"));
    }

    @PostMapping("/simulator/chargers/{id}/restore")
    public ResponseEntity<Map<String, String>> restoreAvailable(@PathVariable Long id) {
        simulatorService.restoreChargerAvailable(id);
        return ResponseEntity.ok(Map.of("message", "Restored charger " + id + " to AVAILABLE"));
    }

    @GetMapping("/simulator/events")
    public ResponseEntity<List<Map<String, Object>>> getSimulatorEvents(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(eventRepository.findRecentEvents(limit));
    }

    // 7. Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }
}

