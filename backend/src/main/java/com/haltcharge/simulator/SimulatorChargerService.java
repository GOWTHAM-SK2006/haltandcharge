package com.haltcharge.simulator;

import com.haltcharge.dto.SessionDto;
import com.haltcharge.entity.Charger;
import com.haltcharge.entity.ChargingSession;
import com.haltcharge.repository.ChargerRepository;
import com.haltcharge.repository.ChargingSessionRepository;
import com.haltcharge.repository.SimulatorEventRepository;
import com.haltcharge.websocket.RealtimeUpdateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SimulatorChargerService implements ChargerCommunicationService {

    private static final Logger log = LoggerFactory.getLogger(SimulatorChargerService.class);

    private final ChargerRepository chargerRepository;
    private final ChargingSessionRepository sessionRepository;
    private final SimulatorEventRepository eventRepository;
    private final RealtimeUpdateService realtimeUpdateService;

    // In-memory simulation state: sessionUid -> SimulationState
    private final Map<String, SimState> activeSimulations = new ConcurrentHashMap<>();

    public SimulatorChargerService(ChargerRepository chargerRepository,
                                   ChargingSessionRepository sessionRepository,
                                   SimulatorEventRepository eventRepository,
                                   RealtimeUpdateService realtimeUpdateService) {
        this.chargerRepository = chargerRepository;
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.realtimeUpdateService = realtimeUpdateService;
    }

    public static class SimState {
        public Long chargerId;
        public String sessionUid;
        public double targetPowerKw;
        public double currentPowerKw;
        public double accumulatedKwh;
        public int initialSoc;
        public int currentSoc;
        public long durationSeconds;
        public BigDecimal tariff;

        public SimState(Long chargerId, String sessionUid, double targetPowerKw, BigDecimal tariff) {
            this.chargerId = chargerId;
            this.sessionUid = sessionUid;
            this.targetPowerKw = targetPowerKw;
            this.currentPowerKw = Math.max(10.0, targetPowerKw * 0.85); // Ramp-up power
            this.accumulatedKwh = 0.0;
            this.initialSoc = 22; // Typical starting SOC
            this.currentSoc = 22;
            this.durationSeconds = 0;
            this.tariff = tariff;
        }
    }

    @Override
    public void startCharging(Long chargerId, String sessionUid, double maxPowerKw) {
        Charger charger = chargerRepository.findById(chargerId).orElse(null);
        BigDecimal tariff = charger != null ? charger.getTariffPerKwh() : BigDecimal.valueOf(18.00);

        SimState state = new SimState(chargerId, sessionUid, maxPowerKw, tariff);
        activeSimulations.put(sessionUid, state);

        chargerRepository.updateStatus(chargerId, "CHARGING");
        eventRepository.logEvent(chargerId, "START_CHARGING", "Simulated session started: " + sessionUid + " at " + maxPowerKw + " kW");
        
        if (charger != null) {
            realtimeUpdateService.publishChargerStatus(chargerId, charger.getIdentifier(), "CHARGING");
        }
        log.info("Simulator: Started charging on charger {} for session {}", chargerId, sessionUid);
    }

    @Override
    public void stopCharging(Long chargerId, String sessionUid) {
        SimState state = null;
        if ("ALL".equalsIgnoreCase(sessionUid)) {
            for (Map.Entry<String, SimState> entry : activeSimulations.entrySet()) {
                if (chargerId.equals(entry.getValue().chargerId)) {
                    state = entry.getValue();
                    activeSimulations.remove(entry.getKey());
                    break;
                }
            }
        } else {
            state = activeSimulations.remove(sessionUid);
        }
        chargerRepository.updateStatus(chargerId, "AVAILABLE");
        eventRepository.logEvent(chargerId, "STOP_CHARGING", "Simulated session stopped: " + sessionUid + 
                (state != null ? " with final energy: " + String.format("%.3f", state.accumulatedKwh) + " kWh" : ""));

        Charger charger = chargerRepository.findById(chargerId).orElse(null);
        if (charger != null) {
            realtimeUpdateService.publishChargerStatus(chargerId, charger.getIdentifier(), "AVAILABLE");
        }
        log.info("Simulator: Stopped charging on charger {} for session {}", chargerId, sessionUid);
    }

    @Override
    public void setChargerOffline(Long chargerId) {
        chargerRepository.updateStatus(chargerId, "OFFLINE");
        eventRepository.logEvent(chargerId, "SIMULATE_OFFLINE", "Admin simulated charger OFFLINE state");
        Charger charger = chargerRepository.findById(chargerId).orElse(null);
        if (charger != null) {
            realtimeUpdateService.publishChargerStatus(chargerId, charger.getIdentifier(), "OFFLINE");
        }
    }

    @Override
    public void setChargerFault(Long chargerId, String errorDetails) {
        chargerRepository.updateStatus(chargerId, "FAULTED");
        eventRepository.logEvent(chargerId, "SIMULATE_FAULT", "Admin simulated charger FAULT: " + errorDetails);
        Charger charger = chargerRepository.findById(chargerId).orElse(null);
        if (charger != null) {
            realtimeUpdateService.publishChargerStatus(chargerId, charger.getIdentifier(), "FAULTED");
        }
    }

    @Override
    public void restoreChargerAvailable(Long chargerId) {
        chargerRepository.updateStatus(chargerId, "AVAILABLE");
        eventRepository.logEvent(chargerId, "RESTORE_ONLINE", "Charger restored to AVAILABLE");
        Charger charger = chargerRepository.findById(chargerId).orElse(null);
        if (charger != null) {
            realtimeUpdateService.publishChargerStatus(chargerId, charger.getIdentifier(), "AVAILABLE");
        }
    }

    // Runs every 2 seconds to simulate telemetry ticks
    @Scheduled(fixedRate = 2000)
    public void tickSimulation() {
        if (activeSimulations.isEmpty()) {
            return;
        }

        double intervalHours = 2.0 / 3600.0;

        for (Map.Entry<String, SimState> entry : activeSimulations.entrySet()) {
            SimState sim = entry.getValue();
            sim.durationSeconds += 2;

            // Minor realistic power fluctuation (+/- 2%)
            double jitter = (Math.random() - 0.5) * 0.04 * sim.targetPowerKw;
            sim.currentPowerKw = Math.max(5.0, Math.min(sim.targetPowerKw, sim.targetPowerKw * 0.95 + jitter));

            // Power taper above 80% SOC
            if (sim.currentSoc > 80) {
                sim.currentPowerKw = sim.currentPowerKw * 0.5; // Tapering down
            }

            double incrementalKwh = sim.currentPowerKw * intervalHours;
            sim.accumulatedKwh += incrementalKwh;

            // Approximate SOC increase: 1 kWh adds roughly ~2% on a standard 50kWh battery
            sim.currentSoc = Math.min(100, sim.initialSoc + (int) (sim.accumulatedKwh * 2.0));

            BigDecimal energyBigDecimal = BigDecimal.valueOf(sim.accumulatedKwh).setScale(3, RoundingMode.HALF_UP);
            BigDecimal powerBigDecimal = BigDecimal.valueOf(sim.currentPowerKw).setScale(2, RoundingMode.HALF_UP);
            BigDecimal costBigDecimal = energyBigDecimal.multiply(sim.tariff).setScale(2, RoundingMode.HALF_UP);

            // Update session in DB
            ChargingSession session = sessionRepository.findBySessionUid(sim.sessionUid).orElse(null);
            if (session != null && "IN_PROGRESS".equals(session.getStatus())) {
                session.setEnergyKwh(energyBigDecimal);
                session.setCurrentPowerKw(powerBigDecimal);
                session.setEstimatedCost(costBigDecimal);
                session.setDurationSeconds(sim.durationSeconds);
                sessionRepository.save(session);

                // Publish WebSocket updates
                SessionDto.SessionResponse resp = toSessionResponse(session, sim.currentSoc);
                realtimeUpdateService.publishSessionUpdate(resp);
            }
        }
    }

    private SessionDto.SessionResponse toSessionResponse(ChargingSession s, int soc) {
        SessionDto.SessionResponse r = new SessionDto.SessionResponse();
        r.setId(s.getId());
        r.setSessionUid(s.getSessionUid());
        r.setUserId(s.getUserId());
        r.setStationId(s.getStationId());
        r.setChargerId(s.getChargerId());
        r.setVehicleId(s.getVehicleId());
        r.setStatus(s.getStatus());
        r.setIsSimulated(s.getIsSimulated());
        r.setTariffSnapshotPerKwh(s.getTariffSnapshotPerKwh());
        r.setEnergyKwh(s.getEnergyKwh());
        r.setCurrentPowerKw(s.getCurrentPowerKw());
        r.setEstimatedCost(s.getEstimatedCost());
        r.setDurationSeconds(s.getDurationSeconds());
        r.setSocPercentage(soc);
        r.setStartedAt(s.getStartedAt());
        r.setEndedAt(s.getEndedAt());
        r.setStopReason(s.getStopReason());
        return r;
    }
}

