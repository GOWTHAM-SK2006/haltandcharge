package com.haltcharge.repository;

import com.haltcharge.entity.Station;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class StationRepository {

    private final JdbcClient jdbcClient;

    public StationRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Optional<Station> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM stations WHERE id = :id AND is_active = true")
                .param("id", id)
                .query((rs, rowNum) -> mapRowToStation(rs))
                .optional();
    }

    public List<Station> findAll() {
        return jdbcClient.sql("SELECT * FROM stations WHERE is_active = true ORDER BY id ASC")
                .query((rs, rowNum) -> mapRowToStation(rs))
                .list();
    }

    public List<Station> findAllAdmin() {
        return jdbcClient.sql("SELECT * FROM stations ORDER BY id ASC")
                .query((rs, rowNum) -> mapRowToStation(rs))
                .list();
    }

    public Station save(Station s) {
        if (s.getId() == null) {
            KeyHolder kh = new GeneratedKeyHolder();
            jdbcClient.sql("""
                INSERT INTO stations (name, address, city, state, postal_code, latitude, longitude, operating_hours, amenities, status, is_active, created_at, updated_at)
                VALUES (:name, :address, :city, :state, :postalCode, :lat, :lng, :opHours, :amenities, :status, :isActive, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)
            .param("name", s.getName())
            .param("address", s.getAddress())
            .param("city", s.getCity())
            .param("state", s.getState())
            .param("postalCode", s.getPostalCode())
            .param("lat", s.getLatitude())
            .param("lng", s.getLongitude())
            .param("opHours", s.getOperatingHours() != null ? s.getOperatingHours() : "24/7")
            .param("amenities", s.getAmenities())
            .param("status", s.getStatus() != null ? s.getStatus() : "OPERATIONAL")
            .param("isActive", s.getIsActive() != null ? s.getIsActive() : true)
            .update(kh, "id");

            Number key = kh.getKey();
            if (key != null) s.setId(key.longValue());
        } else {
            jdbcClient.sql("""
                UPDATE stations SET name = :name, address = :address, city = :city, state = :state,
                postal_code = :postalCode, latitude = :lat, longitude = :lng, operating_hours = :opHours,
                amenities = :amenities, status = :status, is_active = :isActive, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """)
            .param("name", s.getName())
            .param("address", s.getAddress())
            .param("city", s.getCity())
            .param("state", s.getState())
            .param("postalCode", s.getPostalCode())
            .param("lat", s.getLatitude())
            .param("lng", s.getLongitude())
            .param("opHours", s.getOperatingHours())
            .param("amenities", s.getAmenities())
            .param("status", s.getStatus())
            .param("isActive", s.getIsActive())
            .param("id", s.getId())
            .update();
        }
        return s;
    }

    public long count() {
        Long c = jdbcClient.sql("SELECT count(*) FROM stations WHERE is_active = true").query(Long.class).single();
        return c != null ? c : 0L;
    }

    private Station mapRowToStation(java.sql.ResultSet rs) throws java.sql.SQLException {
        Station s = new Station();
        s.setId(rs.getLong("id"));
        s.setName(rs.getString("name"));
        s.setAddress(rs.getString("address"));
        s.setCity(rs.getString("city"));
        s.setState(rs.getString("state"));
        s.setPostalCode(rs.getString("postal_code"));
        s.setLatitude(rs.getBigDecimal("latitude"));
        s.setLongitude(rs.getBigDecimal("longitude"));
        s.setOperatingHours(rs.getString("operating_hours"));
        s.setAmenities(rs.getString("amenities"));
        s.setStatus(rs.getString("status"));
        s.setIsActive(rs.getBoolean("is_active"));
        Timestamp cat = rs.getTimestamp("created_at");
        if (cat != null) s.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
        Timestamp uat = rs.getTimestamp("updated_at");
        if (uat != null) s.setUpdatedAt(uat.toInstant().atOffset(ZoneOffset.UTC));
        return s;
    }
}

