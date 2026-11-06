package com.haltcharge.service;

import com.haltcharge.dto.ChargerDto;
import com.haltcharge.dto.StationDto;
import com.haltcharge.entity.Charger;
import com.haltcharge.entity.Station;
import com.haltcharge.exception.ResourceNotFoundException;
import com.haltcharge.repository.ChargerRepository;
import com.haltcharge.repository.StationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StationService {

    private final StationRepository stationRepository;
    private final ChargerRepository chargerRepository;

    public StationService(StationRepository stationRepository, ChargerRepository chargerRepository) {
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
    }

    public List<StationDto.StationResponse> getAllStations(Double userLat, Double userLng) {
        List<Station> stations = stationRepository.findAll();
        return stations.stream()
                .map(s -> mapToResponse(s, userLat, userLng))
                .collect(Collectors.toList());
    }

    public StationDto.StationResponse getStationById(Long id, Double userLat, Double userLng) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging station not found with id: " + id));
        return mapToResponse(station, userLat, userLng);
    }

    public Station createStation(StationDto.CreateStationRequest req) {
        Station s = new Station();
        s.setName(req.getName());
        s.setAddress(req.getAddress());
        s.setCity(req.getCity());
        s.setState(req.getState());
        s.setPostalCode(req.getPostalCode());
        s.setLatitude(req.getLatitude());
        s.setLongitude(req.getLongitude());
        s.setOperatingHours(req.getOperatingHours());
        s.setAmenities(req.getAmenities());
        s.setStatus("OPERATIONAL");
        s.setIsActive(true);
        return stationRepository.save(s);
    }

    public Station updateStation(Long id, StationDto.CreateStationRequest req) {
        Station s = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + id));
        s.setName(req.getName());
        s.setAddress(req.getAddress());
        s.setCity(req.getCity());
        s.setState(req.getState());
        s.setPostalCode(req.getPostalCode());
        s.setLatitude(req.getLatitude());
        s.setLongitude(req.getLongitude());
        s.setOperatingHours(req.getOperatingHours());
        s.setAmenities(req.getAmenities());
        return stationRepository.save(s);
    }

    public void deactivateStation(Long id) {
        Station s = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found: " + id));
        s.setIsActive(false);
        s.setStatus("DECOMMISSIONED");
        stationRepository.save(s);
    }

    private StationDto.StationResponse mapToResponse(Station s, Double userLat, Double userLng) {
        StationDto.StationResponse resp = new StationDto.StationResponse();
        resp.setId(s.getId());
        resp.setName(s.getName());
        resp.setAddress(s.getAddress());
        resp.setCity(s.getCity());
        resp.setState(s.getState());
        resp.setPostalCode(s.getPostalCode());
        resp.setLatitude(s.getLatitude());
        resp.setLongitude(s.getLongitude());
        resp.setOperatingHours(s.getOperatingHours());
        resp.setAmenities(s.getAmenities());
        resp.setStatus(s.getStatus());
        resp.setIsActive(s.getIsActive());

        // Calculate Haversine distance if user coordinates provided
        if (userLat != null && userLng != null && s.getLatitude() != null && s.getLongitude() != null) {
            resp.setDistanceKm(calculateDistance(userLat, userLng, s.getLatitude().doubleValue(), s.getLongitude().doubleValue()));
        }

        // Attach chargers
        List<Charger> chargers = chargerRepository.findByStationId(s.getId());
        resp.setTotalChargers(chargers.size());
        resp.setAvailableChargers((int) chargers.stream().filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus())).count());

        resp.setChargers(chargers.stream().map(c -> {
            ChargerDto.ChargerResponse cr = new ChargerDto.ChargerResponse();
            cr.setId(c.getId());
            cr.setStationId(c.getStationId());
            cr.setIdentifier(c.getIdentifier());
            cr.setName(c.getName());
            cr.setChargerType(c.getChargerType());
            cr.setMaxPowerKw(c.getMaxPowerKw());
            cr.setStatus(c.getStatus());
            cr.setTariffPerKwh(c.getTariffPerKwh());
            cr.setIsSimulated(c.getIsSimulated());
            cr.setIsActive(c.getIsActive());
            return cr;
        }).collect(Collectors.toList()));

        return resp;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDist = Math.toRadians(lat2 - lat1);
        double lonDist = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDist / 2) * Math.sin(latDist / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDist / 2) * Math.sin(lonDist / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }
}

