package com.haltcharge;

import com.haltcharge.dto.AuthDto;
import com.haltcharge.dto.SessionDto;
import com.haltcharge.dto.StationDto;
import com.haltcharge.entity.Station;
import com.haltcharge.entity.Vehicle;
import com.haltcharge.repository.VehicleRepository;
import com.haltcharge.service.AuthService;
import com.haltcharge.service.ChargingSessionService;
import com.haltcharge.service.StationService;
import com.haltcharge.simulator.ChargerCommunicationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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
    private ChargerCommunicationService simulatorService;

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
        // Koramangala coordinate
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
        // Start charging on Indiranagar Rapid DC (HC-IND-DC-01)
        SessionDto.StartSessionRequest start = new SessionDto.StartSessionRequest();
        start.setChargerIdentifier("HC-IND-DC-01");
        start.setVehicleId(1L);

        SessionDto.SessionResponse session = sessionService.startSession(2L, start);
        assertNotNull(session);
        assertEquals("IN_PROGRESS", session.getStatus());
        assertTrue(session.getIsSimulated());
        assertNotNull(session.getTariffSnapshotPerKwh());

        // Attempting another session while one is active MUST throw BadRequestException
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
        Long testChargerId = 3L; // HC-KOR-AC-01
        
        // Inject fault
        simulatorService.setChargerFault(testChargerId, "Simulated Overcurrent Trip");
        // Restore
        simulatorService.restoreChargerAvailable(testChargerId);
    }
}

