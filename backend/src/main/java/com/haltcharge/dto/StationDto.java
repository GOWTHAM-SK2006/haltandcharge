package com.haltcharge.dto;

import java.math.BigDecimal;
import java.util.List;

public class StationDto {
    public static class StationResponse {
        private Long id;
        private String name;
        private String address;
        private String city;
        private String state;
        private String postalCode;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String operatingHours;
        private String amenities;
        private String status;
        private Boolean isActive;
        private Double distanceKm;
        private Integer totalChargers;
        private Integer availableChargers;
        private List<ChargerDto.ChargerResponse> chargers;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
        public String getOperatingHours() { return operatingHours; }
        public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
        public String getAmenities() { return amenities; }
        public void setAmenities(String amenities) { this.amenities = amenities; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
        public Integer getTotalChargers() { return totalChargers; }
        public void setTotalChargers(Integer totalChargers) { this.totalChargers = totalChargers; }
        public Integer getAvailableChargers() { return availableChargers; }
        public void setAvailableChargers(Integer availableChargers) { this.availableChargers = availableChargers; }
        public List<ChargerDto.ChargerResponse> getChargers() { return chargers; }
        public void setChargers(List<ChargerDto.ChargerResponse> chargers) { this.chargers = chargers; }
    }

    public static class CreateStationRequest {
        private String name;
        private String address;
        private String city;
        private String state;
        private String postalCode;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String operatingHours;
        private String amenities;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
        public String getOperatingHours() { return operatingHours; }
        public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
        public String getAmenities() { return amenities; }
        public void setAmenities(String amenities) { this.amenities = amenities; }
    }
}

