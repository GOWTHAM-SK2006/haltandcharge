package com.haltcharge.controller;

import com.haltcharge.dto.StationDto;
import com.haltcharge.entity.Station;
import com.haltcharge.service.StationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public ResponseEntity<List<StationDto.StationResponse>> getAllStations(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(stationService.getAllStations(lat, lng));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationDto.StationResponse> getStationById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(stationService.getStationById(id, lat, lng));
    }
}

