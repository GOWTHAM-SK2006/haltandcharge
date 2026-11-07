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
import org.springframework.jdbc.core.simple.JdbcClient;
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
    private final JdbcClient jdbcClient;

    public AdminController(UserRepository userRepository,
                           StationRepository stationRepository,
                           ChargerRepository chargerRepository,
                           ChargingSessionRepository sessionRepository,
                           StationService stationService,
                           ChargingSessionService sessionService,
                           ChargerCommunicationService simulatorService,
                           SimulatorEventRepository eventRepository,
                           AuditLogRepository auditLogRepository,
                           JdbcClient jdbcClient) {
        this.userRepository = userRepository;
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.sessionRepository = sessionRepository;
        this.stationService = stationService;
        this.sessionService = sessionService;
        this.simulatorService = simulatorService;
        this.eventRepository = eventRepository;
        this.auditLogRepository = auditLogRepository;
        this.jdbcClient = jdbcClient;
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
    public ResponseEntity<?> createCharger(@RequestBody ChargerDto.CreateChargerRequest req) {
        Long stationId = req.getStationId();
        if (stationId == null || stationRepository.findById(stationId).isEmpty()) {
            List<Station> all = stationRepository.findAllAdmin();
            if (all.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No hub stations found. Please create a station first."));
            }
            stationId = all.get(0).getId();
        }
        Charger c = new Charger();
        c.setStationId(stationId);
        c.setIdentifier(req.getIdentifier());
        c.setName(req.getName());
        c.setChargerType(req.getChargerType() != null ? req.getChargerType() : "DC");
        c.setMaxPowerKw(req.getMaxPowerKw() != null ? req.getMaxPowerKw() : 120.0);
        c.setTariffPerKwh(req.getTariffPerKwh() != null ? req.getTariffPerKwh() : 18.5);
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
        List<User> users = userRepository.findAll().stream()
                .filter(u -> !"ROLE_ADMIN".equalsIgnoreCase(u.getRole()) && !"admin@haltcharge.com".equalsIgnoreCase(u.getEmail()))
                .collect(java.util.stream.Collectors.toList());
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if ("ROLE_ADMIN".equalsIgnoreCase(u.getRole()) || "admin@haltcharge.com".equalsIgnoreCase(u.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete Administrator account"));
        }
        userRepository.deleteUserAndAllAssociatedData(id);
        return ResponseEntity.ok(Map.of("message", "User " + u.getEmail() + " and all associated data deleted successfully"));
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

    // 8. Vehicles Management
    @GetMapping("/vehicles")
    public ResponseEntity<List<Map<String, Object>>> getAllVehicles() {
        return ResponseEntity.ok(jdbcClient.sql("""
            SELECT v.id, v.user_id, v.brand, v.model, v.license_plate, 
                   v.battery_capacity_kwh, v.connector_type, v.max_charging_speed_kw, 
                   v.is_default, v.created_at,
                   u.full_name as user_name, u.email as user_email
            FROM vehicles v
            JOIN users u ON v.user_id = u.id
            ORDER BY v.id DESC
        """).query().listOfRows());
    }

    // 9. Bookings Management
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        return ResponseEntity.ok(jdbcClient.sql("""
            SELECT b.id, b.user_id, b.station_id, b.charger_id, b.vehicle_id,
                   b.start_time, b.end_time, b.status, b.estimated_amount, b.created_at,
                   u.full_name as user_name, u.email as user_email,
                   s.name as station_name, s.city as station_city,
                   c.identifier as charger_identifier, c.name as charger_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN stations s ON b.station_id = s.id
            JOIN chargers c ON b.charger_id = c.id
            ORDER BY b.id DESC
        """).query().listOfRows());
    }

    // 10. Support Tickets
    @GetMapping("/support-tickets")
    public ResponseEntity<List<Map<String, Object>>> getAllSupportTickets() {
        return ResponseEntity.ok(jdbcClient.sql("""
            SELECT t.id, t.user_id, t.subject, t.message, t.status, t.priority, t.created_at, t.updated_at,
                   u.full_name as user_name, u.email as user_email
            FROM support_tickets t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.id DESC
        """).query().listOfRows());
    }

    @PutMapping("/support-tickets/{id}/status")
    public ResponseEntity<Map<String, Object>> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        jdbcClient.sql("UPDATE support_tickets SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id")
                .param("status", status.toUpperCase())
                .param("id", id)
                .update();
        return ResponseEntity.ok(Map.of("message", "Ticket #" + id + " status updated to " + status));
    }

    // 11. Notifications Broadcast
    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getAllNotifications() {
        return ResponseEntity.ok(jdbcClient.sql("""
            SELECT n.id, n.user_id, n.title, n.body, n.type, n.is_read, n.created_at,
                   u.full_name as user_name, u.email as user_email
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            ORDER BY n.id DESC LIMIT 100
        """).query().listOfRows());
    }

    @PostMapping("/notifications")
    public ResponseEntity<Map<String, Object>> broadcastNotification(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "Network Announcement");
        String message = body.getOrDefault("body", "");
        String type = body.getOrDefault("type", "ANNOUNCEMENT");
        List<Long> userIds = jdbcClient.sql("SELECT id FROM users WHERE status = 'ACTIVE'").query(Long.class).list();
        for (Long uId : userIds) {
            jdbcClient.sql("""
                INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
                VALUES (:uId, :title, :body, :type, FALSE, CURRENT_TIMESTAMP)
            """)
            .param("uId", uId)
            .param("title", title)
            .param("body", message)
            .param("type", type)
            .update();
        }
        return ResponseEntity.ok(Map.of("message", "Notification broadcasted to " + userIds.size() + " active user accounts."));
    }

    // 12. Transactions & Ledger
    @GetMapping("/transactions")
    public ResponseEntity<List<Map<String, Object>>> getAllTransactions() {
        return ResponseEntity.ok(jdbcClient.sql("""
            SELECT s.id, s.session_uid as reference, s.user_id, s.estimated_cost as amount,
                   'DEBIT' as transaction_type, 'CHARGING_SESSION' as purpose,
                   s.status as session_status, s.started_at as created_at,
                   u.email as user_email, u.full_name as user_name,
                   st.name as station_name
            FROM charging_sessions s
            JOIN users u ON s.user_id = u.id
            JOIN stations st ON s.station_id = st.id
            ORDER BY s.id DESC LIMIT 200
        """).query().listOfRows());
    }

    // 13. Tariffs
    @PutMapping("/tariffs/chargers/{id}")
    public ResponseEntity<Map<String, Object>> updateTariff(@PathVariable Long id, @RequestParam Double tariff) {
        jdbcClient.sql("UPDATE chargers SET tariff_per_kwh = :tariff, updated_at = CURRENT_TIMESTAMP WHERE id = :id")
                .param("tariff", tariff)
                .param("id", id)
                .update();
        return ResponseEntity.ok(Map.of("message", "Tariff updated to ₹" + tariff + "/kWh"));
    }

    // 14. Reports & Network Analytics
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        Long totalSessions = jdbcClient.sql("SELECT COUNT(*) FROM charging_sessions").query(Long.class).single();
        java.math.BigDecimal totalEnergy = sessionRepository.sumSimulatedEnergy();
        java.math.BigDecimal totalRevenue = sessionRepository.sumSimulatedRevenue();
        Long activeChargers = chargerRepository.countByStatus("CHARGING");
        Long totalChargers = chargerRepository.count();
        double utilization = totalChargers > 0 ? ((double) activeChargers / totalChargers) * 100.0 : 0.0;

        return ResponseEntity.ok(Map.of(
            "totalSessions", totalSessions != null ? totalSessions : 0L,
            "totalEnergyKwh", totalEnergy != null ? totalEnergy.doubleValue() : 0.0,
            "totalRevenue", totalRevenue != null ? totalRevenue.doubleValue() : 0.0,
            "utilizationPercentage", Math.round(utilization * 10.0) / 10.0,
            "networkUptime", "99.8%",
            "avgSessionDurationMinutes", 32,
            "activeChargers", activeChargers,
            "totalChargers", totalChargers
        ));
    }
}

