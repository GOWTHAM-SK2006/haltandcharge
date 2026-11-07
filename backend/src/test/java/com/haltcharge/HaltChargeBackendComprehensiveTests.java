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
import com.haltcharge.simulator.ChargerCommunicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class HaltChargeBackendComprehensiveTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private StationService stationService;

    @Autowired
    private ChargingSessionService sessionService;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    @Autowired
    private ChargerCommunicationService simulatorService;

    @Autowired
    private com.haltcharge.controller.AdminController adminController;

    private String testIdentifier = "HC-TEST-RAPID-01";

    @BeforeEach
    void setupTestData() {
        if (chargerRepository.findByIdentifier(testIdentifier).isEmpty()) {
            StationDto.CreateStationRequest req = new StationDto.CreateStationRequest();
            req.setName("Comprehensive Test Hub");
            req.setAddress("ITPB Road");
            req.setCity("Bengaluru");
            req.setLatitude(BigDecimal.valueOf(12.9719));
            req.setLongitude(BigDecimal.valueOf(77.6412));
            req.setOperatingHours("24/7");
            Station s = stationService.createStation(req);

            Charger c = new Charger();
            c.setStationId(s.getId());
            c.setIdentifier(testIdentifier);
            c.setName("Test HyperFast");
            c.setChargerType("DC");
            c.setMaxPowerKw(BigDecimal.valueOf(150.0));
            c.setStatus("AVAILABLE");
            c.setTariffPerKwh(BigDecimal.valueOf(19.0));
            c.setIsSimulated(true);
            c.setIsActive(true);
            chargerRepository.save(c);

            Vehicle v = new Vehicle();
            v.setUserId(2L);
            v.setBrand("Hyundai");
            v.setModel("Ioniq 5");
            v.setLicensePlate("KA-05-TEST");
            v.setBatteryCapacityKwh(BigDecimal.valueOf(72.6));
            v.setConnectorType("CCS2");
            v.setMaxChargingSpeedKw(BigDecimal.valueOf(150.0));
            v.setIsDefault(true);
            Vehicle savedV = vehicleRepository.save(v);
            testVehicleId = savedV.getId();
        }
    }

    private Long testVehicleId;

    @Test
    @DisplayName("1. User Registration and Login flow")
    void testUserRegistrationAndLogin() {
        AuthDto.RegisterRequest reg = new AuthDto.RegisterRequest();
        reg.setEmail("newuser@haltcharge.com");
        reg.setPassword("NewSecurePass@123");
        reg.setFullName("Rahul Verma");
        reg.setPhoneNumber("+91 9988776655");

        AuthDto.AuthResponse regResp = authService.register(reg);
        assertNotNull(regResp);
        assertEquals("ROLE_CUSTOMER", regResp.getRole());
        assertEquals("newuser@haltcharge.com", regResp.getEmail());

        AuthDto.LoginRequest login = new AuthDto.LoginRequest();
        login.setEmail("newuser@haltcharge.com");
        login.setPassword("NewSecurePass@123");

        AuthDto.AuthResponse loginResp = authService.login(login);
        assertNotNull(loginResp.getToken());
        assertEquals(regResp.getUserId(), loginResp.getUserId());
    }

    @Test
    @DisplayName("2. Stations Listing and Spatial Distance Verification")
    void testStationsAndDistance() {
        List<StationDto.StationResponse> stations = stationService.getAllStations(12.9352, 77.6245);
        assertFalse(stations.isEmpty());

        StationDto.StationResponse nearest = stations.get(0);
        assertNotNull(nearest.getDistanceKm());
        assertTrue(nearest.getDistanceKm() >= 0.0);
        assertNotNull(nearest.getChargers());
        assertFalse(nearest.getChargers().isEmpty());
    }

    @Test
    @Transactional
    @DisplayName("3. Vehicle CRUD & Association with user")
    void testVehicleOperations() {
        Vehicle v = new Vehicle();
        v.setUserId(2L);
        v.setBrand("MG");
        v.setModel("ZS EV");
        v.setLicensePlate("KA-03-EV-1122");
        v.setBatteryCapacityKwh(BigDecimal.valueOf(50.3));
        v.setConnectorType("CCS2");
        v.setMaxChargingSpeedKw(BigDecimal.valueOf(80.0));
        v.setIsDefault(false);

        Vehicle saved = vehicleRepository.save(v);
        assertNotNull(saved.getId());

        List<Vehicle> list = vehicleRepository.findByUserId(2L);
        assertTrue(list.stream().anyMatch(item -> item.getLicensePlate().equals("KA-03-EV-1122")));

        vehicleRepository.delete(saved.getId(), 2L);
        List<Vehicle> afterDelete = vehicleRepository.findByUserId(2L);
        assertFalse(afterDelete.stream().anyMatch(item -> item.getId().equals(saved.getId())));
    }

    @Test
    @Transactional
    @DisplayName("4. Charging Lifecycle with Hardware Simulator Control and Concurrency Lock")
    void testCompleteChargingLifecycle() {
        SessionDto.StartSessionRequest start = new SessionDto.StartSessionRequest();
        start.setChargerIdentifier(testIdentifier);
        start.setVehicleId(testVehicleId);

        SessionDto.SessionResponse session = sessionService.startSession(2L, start);
        assertNotNull(session);
        assertEquals("IN_PROGRESS", session.getStatus());
        assertTrue(session.getIsSimulated());
        assertNotNull(session.getTariffSnapshotPerKwh());

        // Attempting another session while one is active MUST throw RuntimeException
        assertThrows(RuntimeException.class, () -> sessionService.startSession(2L, start));

        // Stop session cleanly
        SessionDto.SessionResponse stopped = sessionService.stopSession(2L, session.getId(), "COMPLETED_BY_DRIVER");
        assertEquals("COMPLETED", stopped.getStatus());
        assertEquals("COMPLETED_BY_DRIVER", stopped.getStopReason());
        assertNotNull(stopped.getEndedAt());
    }

    @Test
    @DisplayName("5. Simulator Hardware Fault & Recovery Lifecycle")
    void testSimulatorHardwareFaultAndRestore() {
        Charger c = chargerRepository.findByIdentifier(testIdentifier).orElseThrow();
        Long testChargerId = c.getId();
        
        // Inject fault
        simulatorService.setChargerFault(testChargerId, "Simulated Overcurrent Trip");
        // Restore
        simulatorService.restoreChargerAvailable(testChargerId);
    }

    @Test
    @Transactional
    @WithMockUser(roles = "ADMIN")
    @DisplayName("6. Admin Dedicated ON/OFF Simulator Hardware Control with Confirmation")
    void testAdminChargerOnAndOffSimulatorControl() {
        Charger c = chargerRepository.findByIdentifier(testIdentifier).orElseThrow();
        Long testChargerId = c.getId();

        // 1. Turn ON Charger
        var onResponse = adminController.turnOnCharger(testChargerId);
        assertNotNull(onResponse);
        assertEquals(200, onResponse.getStatusCode().value());
        assertEquals("Charger turned ON successfully", onResponse.getBody().get("message"));
        assertEquals("AVAILABLE", onResponse.getBody().get("status"));

        // Verify charger state in database
        Charger activeCharger = chargerRepository.findById(testChargerId).orElseThrow();
        assertEquals("AVAILABLE", activeCharger.getStatus());

        // 2. Turn OFF Charger
        var offResponse = adminController.turnOffCharger(testChargerId);
        assertNotNull(offResponse);
        assertEquals(200, offResponse.getStatusCode().value());
        assertEquals("Charger turned OFF successfully", offResponse.getBody().get("message"));
        assertEquals("OFFLINE", offResponse.getBody().get("status"));

        // Verify restored state in database
        Charger idleCharger = chargerRepository.findById(testChargerId).orElseThrow();
        assertEquals("OFFLINE", idleCharger.getStatus());
    }
}
