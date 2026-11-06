package com.haltcharge.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class SimulatorEventRepository {

    private final JdbcClient jdbcClient;

    public SimulatorEventRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public void logEvent(Long chargerId, String eventType, String details) {
        jdbcClient.sql("""
            INSERT INTO simulator_events (charger_id, event_type, details, created_at)
            VALUES (:chargerId, :eventType, :details, CURRENT_TIMESTAMP)
        """)
        .param("chargerId", chargerId)
        .param("eventType", eventType)
        .param("details", details)
        .update();
    }

    public List<Map<String, Object>> findRecentEvents(int limit) {
        return jdbcClient.sql("""
            SELECT se.*, c.identifier as charger_identifier, c.name as charger_name
            FROM simulator_events se
            LEFT JOIN chargers c ON c.id = se.charger_id
            ORDER BY se.id DESC LIMIT :limit
        """)
        .param("limit", limit)
        .query()
        .listOfRows();
    }
}

