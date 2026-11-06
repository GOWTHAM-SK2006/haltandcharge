package com.haltcharge.repository;

import com.haltcharge.entity.ChargingSession;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class ChargingSessionRepository {

    private final JdbcClient jdbcClient;

    public ChargingSessionRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Optional<ChargingSession> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM charging_sessions WHERE id = :id")
                .param("id", id)
                .query((rs, rowNum) -> mapRowToSession(rs))
                .optional();
    }

    public Optional<ChargingSession> findBySessionUid(String sessionUid) {
        return jdbcClient.sql("SELECT * FROM charging_sessions WHERE session_uid = :sessionUid")
                .param("sessionUid", sessionUid)
                .query((rs, rowNum) -> mapRowToSession(rs))
                .optional();
    }

    public Optional<ChargingSession> findActiveSessionByUserId(Long userId) {
        return jdbcClient.sql("SELECT * FROM charging_sessions WHERE user_id = :userId AND status = 'IN_PROGRESS' ORDER BY id DESC LIMIT 1")
                .param("userId", userId)
                .query((rs, rowNum) -> mapRowToSession(rs))
                .optional();
    }

    public Optional<ChargingSession> findActiveSessionByChargerId(Long chargerId) {
        return jdbcClient.sql("SELECT * FROM charging_sessions WHERE charger_id = :chargerId AND status = 'IN_PROGRESS' ORDER BY id DESC LIMIT 1")
                .param("chargerId", chargerId)
                .query((rs, rowNum) -> mapRowToSession(rs))
                .optional();
    }

    public List<ChargingSession> findActiveSessions() {
        return jdbcClient.sql("SELECT * FROM charging_sessions WHERE status = 'IN_PROGRESS' ORDER BY id DESC")
                .query((rs, rowNum) -> mapRowToSession(rs))
                .list();
    }

    public List<ChargingSession> findByUserId(Long userId) {
        return jdbcClient.sql("SELECT * FROM charging_sessions WHERE user_id = :userId ORDER BY id DESC")
                .param("userId", userId)
                .query((rs, rowNum) -> mapRowToSession(rs))
                .list();
    }

    public List<ChargingSession> findAll() {
        return jdbcClient.sql("SELECT * FROM charging_sessions ORDER BY id DESC")
                .query((rs, rowNum) -> mapRowToSession(rs))
                .list();
    }

    public ChargingSession save(ChargingSession s) {
        if (s.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbcClient.sql("""
                INSERT INTO charging_sessions (
                    session_uid, user_id, station_id, charger_id, vehicle_id, status, is_simulated,
                    tariff_snapshot_per_kwh, energy_kwh, current_power_kw, estimated_cost,
                    duration_seconds, started_at, ended_at, stop_reason, created_at, updated_at
                ) VALUES (
                    :sessionUid, :userId, :stationId, :chargerId, :vehicleId, :status, :isSimulated,
                    :tariffSnapshot, :energyKwh, :currentPowerKw, :estimatedCost,
                    :durationSeconds, :startedAt, :endedAt, :stopReason, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            """)
            .param("sessionUid", s.getSessionUid())
            .param("userId", s.getUserId())
            .param("stationId", s.getStationId())
            .param("chargerId", s.getChargerId())
            .param("vehicleId", s.getVehicleId())
            .param("status", s.getStatus() != null ? s.getStatus() : "IN_PROGRESS")
            .param("isSimulated", s.getIsSimulated() != null ? s.getIsSimulated() : true)
            .param("tariffSnapshot", s.getTariffSnapshotPerKwh())
            .param("energyKwh", s.getEnergyKwh() != null ? s.getEnergyKwh() : BigDecimal.ZERO)
            .param("currentPowerKw", s.getCurrentPowerKw() != null ? s.getCurrentPowerKw() : BigDecimal.ZERO)
            .param("estimatedCost", s.getEstimatedCost() != null ? s.getEstimatedCost() : BigDecimal.ZERO)
            .param("durationSeconds", s.getDurationSeconds() != null ? s.getDurationSeconds() : 0L)
            .param("startedAt", s.getStartedAt() != null ? Timestamp.from(s.getStartedAt().toInstant()) : Timestamp.from(java.time.Instant.now()))
            .param("endedAt", s.getEndedAt() != null ? Timestamp.from(s.getEndedAt().toInstant()) : null)
            .param("stopReason", s.getStopReason())
            .update(kh, "id");

            Number key = kh.getKey();
            if (key != null) s.setId(key.longValue());
        } else {
            jdbcClient.sql("""
                UPDATE charging_sessions SET
                    status = :status, energy_kwh = :energyKwh, current_power_kw = :currentPowerKw,
                    estimated_cost = :estimatedCost, duration_seconds = :durationSeconds,
                    ended_at = :endedAt, stop_reason = :stopReason, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """)
            .param("status", s.getStatus())
            .param("energyKwh", s.getEnergyKwh())
            .param("currentPowerKw", s.getCurrentPowerKw())
            .param("estimatedCost", s.getEstimatedCost())
            .param("durationSeconds", s.getDurationSeconds())
            .param("endedAt", s.getEndedAt() != null ? Timestamp.from(s.getEndedAt().toInstant()) : null)
            .param("stopReason", s.getStopReason())
            .param("id", s.getId())
            .update();
        }
        return s;
    }

    public long countByStatus(String status) {
        Long c = jdbcClient.sql("SELECT count(*) FROM charging_sessions WHERE status = :status")
                .param("status", status)
                .query(Long.class)
                .single();
        return c != null ? c : 0L;
    }

    public BigDecimal sumSimulatedEnergy() {
        BigDecimal sum = jdbcClient.sql("SELECT COALESCE(SUM(energy_kwh), 0) FROM charging_sessions WHERE is_simulated = true")
                .query(BigDecimal.class)
                .single();
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumSimulatedRevenue() {
        BigDecimal sum = jdbcClient.sql("SELECT COALESCE(SUM(estimated_cost), 0) FROM charging_sessions WHERE is_simulated = true")
                .query(BigDecimal.class)
                .single();
        return sum != null ? sum : BigDecimal.ZERO;
    }

    private ChargingSession mapRowToSession(java.sql.ResultSet rs) throws java.sql.SQLException {
        ChargingSession s = new ChargingSession();
        s.setId(rs.getLong("id"));
        s.setSessionUid(rs.getString("session_uid"));
        s.setUserId(rs.getLong("user_id"));
        s.setStationId(rs.getLong("station_id"));
        s.setChargerId(rs.getLong("charger_id"));
        long vId = rs.getLong("vehicle_id");
        if (!rs.wasNull()) s.setVehicleId(vId);
        s.setStatus(rs.getString("status"));
        s.setIsSimulated(rs.getBoolean("is_simulated"));
        s.setTariffSnapshotPerKwh(rs.getBigDecimal("tariff_snapshot_per_kwh"));
        s.setEnergyKwh(rs.getBigDecimal("energy_kwh"));
        s.setCurrentPowerKw(rs.getBigDecimal("current_power_kw"));
        s.setEstimatedCost(rs.getBigDecimal("estimated_cost"));
        s.setDurationSeconds(rs.getLong("duration_seconds"));
        Timestamp st = rs.getTimestamp("started_at");
        if (st != null) s.setStartedAt(st.toInstant().atOffset(ZoneOffset.UTC));
        Timestamp et = rs.getTimestamp("ended_at");
        if (et != null) s.setEndedAt(et.toInstant().atOffset(ZoneOffset.UTC));
        s.setStopReason(rs.getString("stop_reason"));
        Timestamp cat = rs.getTimestamp("created_at");
        if (cat != null) s.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
        Timestamp uat = rs.getTimestamp("updated_at");
        if (uat != null) s.setUpdatedAt(uat.toInstant().atOffset(ZoneOffset.UTC));
        return s;
    }
}

