package com.haltcharge.repository;

import com.haltcharge.entity.User;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcClient jdbcClient;

    public UserRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Optional<User> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM users WHERE id = :id")
                .param("id", id)
                .query((rs, rowNum) -> {
                    User u = new User();
                    u.setId(rs.getLong("id"));
                    u.setEmail(rs.getString("email"));
                    u.setPasswordHash(rs.getString("password_hash"));
                    u.setFullName(rs.getString("full_name"));
                    u.setPhoneNumber(rs.getString("phone_number"));
                    u.setRole(rs.getString("role"));
                    u.setStatus(rs.getString("status"));
                    u.setWalletBalance(rs.getBigDecimal("wallet_balance"));
                    Timestamp cat = rs.getTimestamp("created_at");
                    if (cat != null) u.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
                    Timestamp uat = rs.getTimestamp("updated_at");
                    if (uat != null) u.setUpdatedAt(uat.toInstant().atOffset(ZoneOffset.UTC));
                    return u;
                })
                .optional();
    }

    public Optional<User> findByEmail(String email) {
        return jdbcClient.sql("SELECT * FROM users WHERE LOWER(email) = LOWER(:email)")
                .param("email", email)
                .query((rs, rowNum) -> {
                    User u = new User();
                    u.setId(rs.getLong("id"));
                    u.setEmail(rs.getString("email"));
                    u.setPasswordHash(rs.getString("password_hash"));
                    u.setFullName(rs.getString("full_name"));
                    u.setPhoneNumber(rs.getString("phone_number"));
                    u.setRole(rs.getString("role"));
                    u.setStatus(rs.getString("status"));
                    u.setWalletBalance(rs.getBigDecimal("wallet_balance"));
                    Timestamp cat = rs.getTimestamp("created_at");
                    if (cat != null) u.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
                    Timestamp uat = rs.getTimestamp("updated_at");
                    if (uat != null) u.setUpdatedAt(uat.toInstant().atOffset(ZoneOffset.UTC));
                    return u;
                })
                .optional();
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbcClient.sql("SELECT count(*) FROM users WHERE LOWER(email) = LOWER(:email)")
                .param("email", email)
                .query(Integer.class)
                .single();
        return count != null && count > 0;
    }

    public User save(User user) {
        if (user.getId() == null) {
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcClient.sql("""
                INSERT INTO users (email, password_hash, full_name, phone_number, role, status, wallet_balance, created_at, updated_at)
                VALUES (:email, :passwordHash, :fullName, :phoneNumber, :role, :status, :walletBalance, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """)
            .param("email", user.getEmail())
            .param("passwordHash", user.getPasswordHash())
            .param("fullName", user.getFullName())
            .param("phoneNumber", user.getPhoneNumber())
            .param("role", user.getRole())
            .param("status", user.getStatus())
            .param("walletBalance", user.getWalletBalance())
            .update(keyHolder, "id");

            Number key = keyHolder.getKey();
            if (key != null) {
                user.setId(key.longValue());
            }
        } else {
            jdbcClient.sql("""
                UPDATE users SET full_name = :fullName, phone_number = :phoneNumber, status = :status,
                wallet_balance = :walletBalance, updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """)
            .param("fullName", user.getFullName())
            .param("phoneNumber", user.getPhoneNumber())
            .param("status", user.getStatus())
            .param("walletBalance", user.getWalletBalance())
            .param("id", user.getId())
            .update();
        }
        return user;
    }

    public List<User> findAll() {
        return jdbcClient.sql("SELECT * FROM users ORDER BY id DESC")
                .query((rs, rowNum) -> {
                    User u = new User();
                    u.setId(rs.getLong("id"));
                    u.setEmail(rs.getString("email"));
                    u.setFullName(rs.getString("full_name"));
                    u.setPhoneNumber(rs.getString("phone_number"));
                    u.setRole(rs.getString("role"));
                    u.setStatus(rs.getString("status"));
                    u.setWalletBalance(rs.getBigDecimal("wallet_balance"));
                    Timestamp cat = rs.getTimestamp("created_at");
                    if (cat != null) u.setCreatedAt(cat.toInstant().atOffset(ZoneOffset.UTC));
                    return u;
                })
                .list();
    }

    public long count() {
        Long c = jdbcClient.sql("SELECT count(*) FROM users").query(Long.class).single();
        return c != null ? c : 0L;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUserAndAllAssociatedData(Long userId) {
        jdbcClient.sql("DELETE FROM favourites WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM support_tickets WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM notifications WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM bookings WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM charging_sessions WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM vehicles WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM audit_logs WHERE user_id = :userId").param("userId", userId).update();
        jdbcClient.sql("DELETE FROM users WHERE id = :userId").param("userId", userId).update();
    }
}

