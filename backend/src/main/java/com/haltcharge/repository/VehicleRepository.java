package com.haltcharge.repository;

import com.haltcharge.entity.Vehicle;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class VehicleRepository {

    private final JdbcClient jdbcClient;

    public VehicleRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Optional<Vehicle> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM vehicles WHERE id = :id")
                .param("id", id)
                .query((rs, rowNum) -> mapRowToVehicle(rs))
                .optional();
    }

    public List<Vehicle> findByUserId(Long userId) {
        return jdbcClient.sql("SELECT * FROM vehicles WHERE user_id = :userId ORDER BY is_default DESC, id DESC")
                .param("userId", userId)
                .query((rs, rowNum) -> mapRowToVehicle(rs))
                .list();
    }

    public Vehicle save(Vehicle v) {
        if (v.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbcClient.sql("""
                INSERT INTO vehicles (user_id, brand, model, license_plate, battery_capacity_kwh, connector_type, max_charging_speed_kw, is_default, created_at, updated_at)
                VALUES (:userId, :brand, :model, :licensePlate, :batteryCapacity, :connectorType, :maxSpeed, :isDefault, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)
            .param("userId", v.getUserId())
            .param("brand", v.getBrand())
            .param("model", v.getModel())
            .param("licensePlate", v.getLicensePlate())
            .param("batteryCapacity", v.getBatteryCapacityKwh())
            .param("connectorType", v.getConnectorType())
            .param("maxSpeed", v.getMaxChargingSpeedKw())
            .param("isDefault", v.getIsDefault() != null ? v.getIsDefault() : false)
            .update(kh, "id");

            Number key = kh.getKey();
            if (key != null) v.setId(key.longValue());
        } else {
            jdbcClient.sql("""
                UPDATE vehicles SET brand = :brand, model = :model, license_plate = :licensePlate,
                battery_capacity_kwh = :batteryCapacity, connector_type = :connectorType,
                max_charging_speed_kw = :maxSpeed, is_default = :isDefault, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id AND user_id = :userId
            """)
            .param("brand", v.getBrand())
            .param("model", v.getModel())
            .param("licensePlate", v.getLicensePlate())
            .param("batteryCapacity", v.getBatteryCapacityKwh())
            .param("connectorType", v.getConnectorType())
            .param("maxSpeed", v.getMaxChargingSpeedKw())
            .param("isDefault", v.getIsDefault())
            .param("id", v.getId())
            .param("userId", v.getUserId())
            .update();
        }
        return v;
    }

    public void delete(Long id, Long userId) {
        jdbcClient.sql("DELETE FROM vehicles WHERE id = :id AND user_id = :userId")
                .param("id", id)
                .param("userId", userId)
                .update();
    }

    private Vehicle mapRowToVehicle(java.sql.ResultSet rs) throws java.sql.SQLException {
        Vehicle v = new Vehicle();
        v.setId(rs.getLong("id"));
        v.setUserId(rs.getLong("user_id"));
        v.setBrand(rs.getString("brand"));
        v.setModel(rs.getString("model"));
        v.setLicensePlate(rs.getString("license_plate"));
        v.setBatteryCapacityKwh(rs.getBigDecimal("battery_capacity_kwh"));
        v.setConnectorType(rs.getString("connector_type"));
        v.setMaxChargingSpeedKw(rs.getBigDecimal("max_charging_speed_kw"));
        v.setIsDefault(rs.getBoolean("is_default"));
        Timestamp cat = rs.getTimestamp("created_at");
        if (cat != null) v.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
        Timestamp uat = rs.getTimestamp("updated_at");
        if (uat != null) v.setUpdatedAt(uat.toInstant().atOffset(ZoneOffset.UTC));
        return v;
    }
}

