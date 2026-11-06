package com.haltcharge.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtProviderValidationTest {

    @Test
    @DisplayName("Should throw IllegalStateException with helpful message when JWT_SECRET is empty")
    void testMissingSecretThrowsException() {
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            new JwtProvider("", 86400000L);
        });
        assertTrue(ex.getMessage().contains("Missing mandatory environment variable 'JWT_SECRET'"));
    }

    @Test
    @DisplayName("Should throw IllegalStateException when JWT_SECRET is shorter than 32 bytes (256 bits)")
    void testWeakSecretThrowsException() {
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            new JwtProvider("short-secret-less-than-32-b", 86400000L);
        });
        assertTrue(ex.getMessage().contains("is too weak! Current length"));
    }

    @Test
    @DisplayName("Should initialize and correctly sign and verify tokens with valid 256-bit secret")
    void testValidSecretInitializesAndSignsToken() {
        String validSecret = "a-very-strong-and-secure-secret-key-of-at-least-32-bytes!";
        JwtProvider provider = new JwtProvider(validSecret, 3600000L);

        String token = provider.generateToken(101L, "driver@haltcharge.com", "ROLE_CUSTOMER");
        assertNotNull(token);
        assertEquals("driver@haltcharge.com", provider.getEmailFromToken(token));
        assertEquals(101L, provider.getUserIdFromToken(token));
        assertEquals("ROLE_CUSTOMER", provider.getRoleFromToken(token));
    }
}

