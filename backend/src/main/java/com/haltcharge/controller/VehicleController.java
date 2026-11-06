package com.haltcharge.controller;

import com.haltcharge.dto.VehicleDto;
import com.haltcharge.entity.Vehicle;
import com.haltcharge.repository.VehicleRepository;
import com.haltcharge.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getMyVehicles(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(vehicleRepository.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody VehicleDto.VehicleRequest req) {
        Vehicle v = new Vehicle();
        v.setUserId(user.getId());
        v.setBrand(req.getBrand());
        v.setModel(req.getModel());
        v.setLicensePlate(req.getLicensePlate());
        v.setBatteryCapacityKwh(req.getBatteryCapacityKwh());
        v.setConnectorType(req.getConnectorType());
        v.setMaxChargingSpeedKw(req.getMaxChargingSpeedKw());
        v.setIsDefault(req.getIsDefault() != null ? req.getIsDefault() : false);
        return ResponseEntity.ok(vehicleRepository.save(v));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id,
            @RequestBody VehicleDto.VehicleRequest req) {
        Vehicle v = new Vehicle();
        v.setId(id);
        v.setUserId(user.getId());
        v.setBrand(req.getBrand());
        v.setModel(req.getModel());
        v.setLicensePlate(req.getLicensePlate());
        v.setBatteryCapacityKwh(req.getBatteryCapacityKwh());
        v.setConnectorType(req.getConnectorType());
        v.setMaxChargingSpeedKw(req.getMaxChargingSpeedKw());
        v.setIsDefault(req.getIsDefault() != null ? req.getIsDefault() : false);
        return ResponseEntity.ok(vehicleRepository.save(v));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id) {
        vehicleRepository.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}

