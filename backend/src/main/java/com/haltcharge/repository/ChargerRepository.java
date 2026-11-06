package com.haltcharge.repository;

import com.haltcharge.entity.Charger;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class ChargerRepository {

    private final JdbcClient jdbcClient;

    public ChargerRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Optional<Charger> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM chargers WHERE id = :id AND is_active = true")
                .param("id", id)
                .query((rs, rowNum) -> mapRowToCharger(rs))
                .optional();
    }

    public Optional<Charger> findByIdentifier(String identifier) {
        return jdbcClient.sql("SELECT * FROM chargers WHERE UPPER(identifier) = UPPER(:identifier) AND is_active = true")
                .param("identifier", identifier)
                .query((rs, rowNum) -> mapRowToCharger(rs))
                .optional();
    }

    public List<Charger> findByStationId(Long stationId) {
        return jdbcClient.sql("SELECT * FROM chargers WHERE station_id = :stationId AND is_active = true ORDER BY id ASC")
                .param("stationId", stationId)
                .query((rs, rowNum) -> mapRowToCharger(rs))
                .list();
    }

    public List<Charger> findAll() {
        return jdbcClient.sql("SELECT * FROM chargers WHERE is_active = true ORDER BY id ASC")
                .query((rs, rowNum) -> mapRowToCharger(rs))
                .list();
    }

    public List<Charger> findAllAdmin() {
        return jdbcClient.sql("SELECT * FROM chargers ORDER BY id ASC")
                .query((rs, rowNum) -> mapRowToCharger(rs))
                .list();
    }

    public Charger save(Charger c) {
        if (c.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbcClient.sql("""
                INSERT INTO chargers (station_id, identifier, name, charger_type, max_power_kw, status, tariff_per_kwh, is_simulated, is_active, created_at, updated_at)
                VALUES (:stationId, :identifier, :name, :chargerType, :maxPowerKw, :status, :tariffPerKwh, :isSimulated, :isActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)
            .param("stationId", c.getStationId())
            .param("identifier", c.getIdentifier())
            .param("name", c.getName())
            .param("chargerType", c.getChargerType())
            .param("maxPowerKw", c.getMaxPowerKw())
            .param("status", c.getStatus() != null ? c.getStatus() : "AVAILABLE")
            .param("tariffPerKwh", c.getTariffPerKwh())
            .param("isSimulated", c.getIsSimulated() != null ? c.getIsSimulated() : true)
            .param("isActive", c.getIsActive() != null ? c.getIsActive() : true)
            .update(kh, "id");

            Number key = kh.getKey();
            if (key != null) c.setId(key.longValue());
        } else {
            jdbcClient.sql("""
                UPDATE chargers SET station_id = :stationId, identifier = :identifier, name = :name,
                charger_type = :chargerType, max_power_kw = :maxPowerKw, status = :status,
                tariff_per_kwh = :tariffPerKwh, is_simulated = :isSimulated, is_active = :isActive, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """)
            .param("stationId", c.getStationId())
            .param("identifier", c.getIdentifier())
            .param("name", c.getName())
            .param("chargerType", c.getChargerType())
            .param("maxPowerKw", c.getMaxPowerKw())
            .param("status", c.getStatus())
            .param("tariffPerKwh", c.getTariffPerKwh())
            .param("isSimulated", c.getIsSimulated())
            .param("isActive", c.getIsActive())
            .param("id", c.getId())
            .update();
        }
        return c;
    }

    public void updateStatus(Long id, String status) {
        jdbcClient.sql("UPDATE chargers SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id")
                .param("status", status)
                .param("id", id)
                .update();
    }

    public long countByStatus(String status) {
        Long c = jdbcClient.sql("SELECT count(*) FROM chargers WHERE status = :status AND is_active = true")
                .param("status", status)
                .query(Long.class)
                .single();
        return c != null ? c : 0L;
    }

    public long count() {
        Long c = jdbcClient.sql("SELECT count(*) FROM chargers WHERE is_active = true").query(Long.class).single();
        return c != null ? c : 0L;
    }

    private Charger mapRowToCharger(java.sql.ResultSet rs) throws java.sql.SQLException {
        Charger c = new Charger();
        c.setId(rs.getLong("id"));
        c.setStationId(rs.getLong("station_id"));
        c.setIdentifier(rs.getString("identifier"));
        c.setName(rs.getString("name"));
        c.setChargerType(rs.getString("charger_type"));
        c.setMaxPowerKw(rs.getBigDecimal("max_power_kw"));
        c.setStatus(rs.getString("status"));
        c.setTariffPerKwh(rs.getBigDecimal("tariff_per_kwh"));
        c.setIsSimulated(rs.getBoolean("is_simulated"));
        c.setIsActive(rs.getBoolean("is_active"));
        Timestamp cat = rs.getTimestamp("created_at");
        if (cat != null) c.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
        Timestamp uat = rs.getTimestamp("updated_at");
        if (uat != null) c.setUpdatedAt(uat.toInstant().atOffset(ZoneOffset.UTC));
        return c;
    }
}

