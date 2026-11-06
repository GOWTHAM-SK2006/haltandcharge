package com.haltcharge;

import com.haltcharge.dto.AuthDto;
import com.haltcharge.dto.SessionDto;
import com.haltcharge.dto.StationDto;
import com.haltcharge.entity.Charger;
import com.haltcharge.entity.Station;
import com.haltcharge.entity.Vehicle;
import com.haltcharge.repository.ChargerRepository;
import com.haltcharge.repository.VehicleRepository;
import com.haltcharge.service.AuthService;
import com.haltcharge.service.ChargingSessionService;
import com.haltcharge.service.StationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    private Long testStationId;
    private String testChargerIdentifier = "HC-TEST-DC-01";

    @BeforeEach
    void setupTestEnvironment() {
        if (chargerRepository.findByIdentifier(testChargerIdentifier).isEmpty()) {
            StationDto.CreateStationRequest req = new StationDto.CreateStationRequest();
            req.setName("Test Charging Station");
            req.setAddress("Test Road, Koramangala");
            req.setCity("Bengaluru");
            req.setLatitude(BigDecimal.valueOf(12.9352));
            req.setLongitude(BigDecimal.valueOf(77.6245));
            req.setOperatingHours("24/7");
            Station s = stationService.createStation(req);
            testStationId = s.getId();

            Charger c = new Charger();
            c.setStationId(s.getId());
            c.setIdentifier(testChargerIdentifier);
            c.setName("Test DC Rapid");
            c.setChargerType("DC");
            c.setMaxPowerKw(BigDecimal.valueOf(120.0));
            c.setStatus("AVAILABLE");
            c.setTariffPerKwh(BigDecimal.valueOf(18.0));
            c.setIsSimulated(true);
            c.setIsActive(true);
            chargerRepository.save(c);

            Vehicle v = new Vehicle();
            v.setUserId(2L);
            v.setBrand("Tata");
            v.setModel("Nexon EV");
            v.setLicensePlate("KA-01-TEST");
            v.setBatteryCapacityKwh(BigDecimal.valueOf(40.5));
            v.setConnectorType("CCS2");
            v.setMaxChargingSpeedKw(BigDecimal.valueOf(50.0));
            v.setIsDefault(true);
            Vehicle savedV = vehicleRepository.save(v);
            testVehicleId = savedV.getId();
        }
    }

    private Long testVehicleId;

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

        // Test admin login as well
        AuthDto.LoginRequest adminLogin = new AuthDto.LoginRequest();
        adminLogin.setEmail("admin@haltcharge.com");
        adminLogin.setPassword("Password@123");

        AuthDto.AuthResponse adminResp = authService.login(adminLogin);
        assertNotNull(adminResp);
        assertEquals("ROLE_ADMIN", adminResp.getRole());
    }

    @Test
    @DisplayName("Should fetch charging stations with distance calculation")
    void testStationFetch() {
        List<StationDto.StationResponse> stations = stationService.getAllStations(12.9352, 77.6245);
        assertFalse(stations.isEmpty());
        assertNotNull(stations.get(0).getDistanceKm());
    }

    @Test
    @Transactional
    @DisplayName("Should simulate complete charging lifecycle safely")
    void testChargingSessionLifecycle() {
        SessionDto.StartSessionRequest startReq = new SessionDto.StartSessionRequest();
        startReq.setChargerIdentifier(testChargerIdentifier);
        startReq.setVehicleId(testVehicleId);

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
