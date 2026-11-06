package com.haltcharge.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtProvider.class);
    private static final int MIN_SECRET_LENGTH_BYTES = 32; // 256-bit required for HMAC-SHA256

    private final SecretKey key;
    private final long expirationMs;

    public JwtProvider(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        
        // Strict startup validation for JWT_SECRET
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                "\n========================================================================================\n" +
                "STARTUP ERROR: Missing mandatory environment variable 'JWT_SECRET'!\n" +
                "Please configure JWT_SECRET in your Railway service variables or environment.\n" +
                "It must be a strong secret of at least 32 characters (256 bits).\n" +
                "Example: Generate using `openssl rand -hex 32`\n" +
                "========================================================================================\n"
            );
        }

        byte[] secretBytes = secret.trim().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MIN_SECRET_LENGTH_BYTES) {
            throw new IllegalStateException(
                "\n========================================================================================\n" +
                "STARTUP ERROR: 'JWT_SECRET' is too weak! Current length: " + secretBytes.length + " bytes.\n" +
                "HMAC-SHA256 requires at least " + MIN_SECRET_LENGTH_BYTES + " bytes (256 bits).\n" +
                "Please provide a longer secret key in Railway service variables.\n" +
                "========================================================================================\n"
            );
        }

        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
        log.info("JwtProvider initialized successfully with secure {}-bit HMAC key.", secretBytes.length * 8);
    }

    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmailFromToken(String token) {
        return validateAndGetClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        return validateAndGetClaims(token).get("userId", Long.class);
    }

    public String getRoleFromToken(String token) {
        return validateAndGetClaims(token).get("role", String.class);
    }
}
