package com.haltcharge.service;

import com.haltcharge.dto.SessionDto;
import com.haltcharge.entity.Charger;
import com.haltcharge.entity.ChargingSession;
import com.haltcharge.entity.Station;
import com.haltcharge.entity.User;
import com.haltcharge.exception.BadRequestException;
import com.haltcharge.exception.ResourceNotFoundException;
import com.haltcharge.repository.AuditLogRepository;
import com.haltcharge.repository.ChargerRepository;
import com.haltcharge.repository.ChargingSessionRepository;
import com.haltcharge.repository.StationRepository;
import com.haltcharge.repository.UserRepository;
import com.haltcharge.repository.VehicleRepository;
import com.haltcharge.simulator.ChargerCommunicationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChargingSessionService {

    private final ChargingSessionRepository sessionRepository;
    private final ChargerRepository chargerRepository;
    private final StationRepository stationRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ChargerCommunicationService chargerCommunicationService;
    private final AuditLogRepository auditLogRepository;

    public ChargingSessionService(ChargingSessionRepository sessionRepository,
                                  ChargerRepository chargerRepository,
                                  StationRepository stationRepository,
                                  UserRepository userRepository,
                                  VehicleRepository vehicleRepository,
                                  ChargerCommunicationService chargerCommunicationService,
                                  AuditLogRepository auditLogRepository) {
        this.sessionRepository = sessionRepository;
        this.chargerRepository = chargerRepository;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.chargerCommunicationService = chargerCommunicationService;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public SessionDto.SessionResponse startSession(Long userId, SessionDto.StartSessionRequest req) {
        // 1. Concurrency check: user cannot have more than 1 active session
        sessionRepository.findActiveSessionByUserId(userId).ifPresent(active -> {
            throw new BadRequestException("You already have an active charging session (UID: " + active.getSessionUid() + "). Please complete or stop it first.");
        });

        // 2. Validate charger exists and is available
        Charger charger = chargerRepository.findByIdentifier(req.getChargerIdentifier().trim())
                .orElseThrow(() -> new ResourceNotFoundException("EV Charger not found with identifier: " + req.getChargerIdentifier()));

        if (!"AVAILABLE".equalsIgnoreCase(charger.getStatus())) {
            throw new BadRequestException("Charger " + charger.getIdentifier() + " is currently " + charger.getStatus());
        }

        // 3. Charger must not have an active session in DB
        sessionRepository.findActiveSessionByChargerId(charger.getId()).ifPresent(active -> {
            throw new BadRequestException("Charger already in use by another session");
        });

        // 4. Create new charging session with immutable tariff snapshot
        String sessionUid = "HC-SES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        ChargingSession session = new ChargingSession();
        session.setSessionUid(sessionUid);
        session.setUserId(userId);
        session.setStationId(charger.getStationId());
        session.setChargerId(charger.getId());
        session.setVehicleId(req.getVehicleId());
        session.setStatus("IN_PROGRESS");
        session.setIsSimulated(charger.getIsSimulated());
        session.setTariffSnapshotPerKwh(charger.getTariffPerKwh());
        session.setEnergyKwh(BigDecimal.ZERO);
        session.setCurrentPowerKw(charger.getMaxPowerKw());
        session.setEstimatedCost(BigDecimal.ZERO);
        session.setDurationSeconds(0L);
        session.setStartedAt(OffsetDateTime.now());

        ChargingSession saved = sessionRepository.save(session);

        // 5. Trigger simulator
        chargerCommunicationService.startCharging(charger.getId(), sessionUid, charger.getMaxPowerKw().doubleValue());

        // 6. Audit log
        userRepository.findById(userId).ifPresent(u -> 
            auditLogRepository.log(userId, u.getEmail(), "START_CHARGING", "SESSION", sessionUid, 
                "Charging initiated on charger " + charger.getIdentifier(), "0.0.0.0")
        );

        return mapToDto(saved);
    }

    @Transactional
    public SessionDto.SessionResponse stopSession(Long userId, Long sessionId, String reason) {
        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Charging session not found with ID: " + sessionId));

        // Ownership check
        if (!session.getUserId().equals(userId)) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
                throw new BadRequestException("You do not have authorization to stop this session");
            }
        }

        if (!"IN_PROGRESS".equalsIgnoreCase(session.getStatus())) {
            return mapToDto(session); // Idempotent return
        }

        // Complete session
        session.setStatus("COMPLETED");
        session.setEndedAt(OffsetDateTime.now());
        session.setStopReason(reason != null ? reason : "STOPPED_BY_USER");
        session.setCurrentPowerKw(BigDecimal.ZERO);
        
        ChargingSession updated = sessionRepository.save(session);

        // Notify simulator to release charger
        chargerCommunicationService.stopCharging(session.getChargerId(), session.getSessionUid());

        // Audit log
        userRepository.findById(userId).ifPresent(u ->
            auditLogRepository.log(userId, u.getEmail(), "STOP_CHARGING", "SESSION", session.getSessionUid(),
                "Charging ended. Energy: " + session.getEnergyKwh() + " kWh, Cost: ₹" + session.getEstimatedCost(), "0.0.0.0")
        );

        return mapToDto(updated);
    }

    public SessionDto.SessionResponse getActiveSessionForUser(Long userId) {
        return sessionRepository.findActiveSessionByUserId(userId)
                .map(this::mapToDto)
                .orElse(null);
    }

    public List<SessionDto.SessionResponse> getUserSessions(Long userId) {
        return sessionRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SessionDto.SessionResponse> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SessionDto.SessionResponse getSessionById(Long id) {
        return sessionRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Charging session not found: " + id));
    }

    private SessionDto.SessionResponse mapToDto(ChargingSession s) {
        SessionDto.SessionResponse resp = new SessionDto.SessionResponse();
        resp.setId(s.getId());
        resp.setSessionUid(s.getSessionUid());
        resp.setUserId(s.getUserId());
        resp.setStationId(s.getStationId());
        resp.setChargerId(s.getChargerId());
        resp.setVehicleId(s.getVehicleId());
        resp.setStatus(s.getStatus());
        resp.setIsSimulated(s.getIsSimulated());
        resp.setTariffSnapshotPerKwh(s.getTariffSnapshotPerKwh());
        resp.setEnergyKwh(s.getEnergyKwh());
        resp.setCurrentPowerKw(s.getCurrentPowerKw());
        resp.setEstimatedCost(s.getEstimatedCost());
        resp.setDurationSeconds(s.getDurationSeconds());
        resp.setStartedAt(s.getStartedAt());
        resp.setEndedAt(s.getEndedAt());
        resp.setStopReason(s.getStopReason());

        // Enrich names
        stationRepository.findById(s.getStationId()).ifPresent(st -> resp.setStationName(st.getName()));
        chargerRepository.findById(s.getChargerId()).ifPresent(ch -> resp.setChargerIdentifier(ch.getIdentifier()));
        userRepository.findById(s.getUserId()).ifPresent(u -> resp.setUserEmail(u.getEmail()));
        if (s.getVehicleId() != null) {
            vehicleRepository.findById(s.getVehicleId()).ifPresent(v -> resp.setVehicleModel(v.getBrand() + " " + v.getModel()));
        }

        return resp;
    }
}

