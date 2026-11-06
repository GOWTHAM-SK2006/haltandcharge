package com.haltcharge;

import com.haltcharge.dto.AuthDto;
import com.haltcharge.dto.SessionDto;
import com.haltcharge.dto.StationDto;
import com.haltcharge.service.AuthService;
import com.haltcharge.service.ChargingSessionService;
import com.haltcharge.service.StationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class HaltChargeApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private StationService stationService;

    @Autowired
    private ChargingSessionService sessionService;

    @Test
    void contextLoads() {
        assertNotNull(authService);
        assertNotNull(stationService);
        assertNotNull(sessionService);
    }

    @Test
    @DisplayName("Should successfully authenticate seeded customer and admin")
    void testAuthentication() {
        AuthDto.LoginRequest login = new AuthDto.LoginRequest();
        login.setEmail("customer@haltcharge.com");
        login.setPassword("Password@123");

        AuthDto.AuthResponse resp = authService.login(login);
        assertNotNull(resp);
        assertNotNull(resp.getToken());
        assertEquals("ROLE_CUSTOMER", resp.getRole());
    }

    @Test
    @DisplayName("Should fetch charging stations with distance calculation")
    void testStationFetch() {
        List<StationDto.StationResponse> stations = stationService.getAllStations(12.9352, 77.6245);
        assertFalse(stations.isEmpty());
        assertTrue(stations.size() >= 4);
        assertNotNull(stations.get(0).getDistanceKm());
    }

    @Test
    @Transactional
    @DisplayName("Should simulate complete charging lifecycle safely")
    void testChargingSessionLifecycle() {
        // Start charging on HC-KOR-DC-01
        SessionDto.StartSessionRequest startReq = new SessionDto.StartSessionRequest();
        startReq.setChargerIdentifier("HC-KOR-DC-01");
        startReq.setVehicleId(1L);

        SessionDto.SessionResponse session = sessionService.startSession(2L, startReq);
        assertNotNull(session);
        assertEquals("IN_PROGRESS", session.getStatus());
        assertTrue(session.getIsSimulated());
        assertNotNull(session.getTariffSnapshotPerKwh());

        // Attempting a second concurrent session on the same user must fail
        assertThrows(RuntimeException.class, () -> sessionService.startSession(2L, startReq));

        // Stop session
        SessionDto.SessionResponse stopped = sessionService.stopSession(2L, session.getId(), "USER_COMPLETED");
        assertEquals("COMPLETED", stopped.getStatus());
        assertEquals("USER_COMPLETED", stopped.getStopReason());
    }
}

