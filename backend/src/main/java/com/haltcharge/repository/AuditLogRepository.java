package com.haltcharge.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Repository
public class AuditLogRepository {

    private final JdbcClient jdbcClient;

    public AuditLogRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public void log(Long userId, String email, String action, String resourceType, String resourceId, String details, String ipAddress) {
        jdbcClient.sql("""
            INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, details, ip_address, created_at)
            VALUES (:userId, :email, :action, :resourceType, :resourceId, :details, :ipAddress, CURRENT_TIMESTAMP)
        """)
        .param("userId", userId)
        .param("email", email)
        .param("action", action)
        .param("resourceType", resourceType)
        .param("resourceId", resourceId)
        .param("details", details)
        .param("ipAddress", ipAddress)
        .update();
    }

    public List<Map<String, Object>> findAll() {
        return jdbcClient.sql("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200").query().listOfRows();
    }
}

