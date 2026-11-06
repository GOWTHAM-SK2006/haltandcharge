package com.haltcharge.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class SessionDto {
    public static class StartSessionRequest {
        private String chargerIdentifier;
        private Long vehicleId;

        public String getChargerIdentifier() { return chargerIdentifier; }
        public void setChargerIdentifier(String chargerIdentifier) { this.chargerIdentifier = chargerIdentifier; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    }

    public static class SessionResponse {
        private Long id;
        private String sessionUid;
        private Long userId;
        private String userEmail;
        private Long stationId;
        private String stationName;
        private Long chargerId;
        private String chargerIdentifier;
        private Long vehicleId;
        private String vehicleModel;
        private String status;
        private Boolean isSimulated;
        private BigDecimal tariffSnapshotPerKwh;
        private BigDecimal energyKwh;
        private BigDecimal currentPowerKw;
        private BigDecimal estimatedCost;
        private Long durationSeconds;
        private Integer socPercentage;
        private OffsetDateTime startedAt;
        private OffsetDateTime endedAt;
        private String stopReason;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getSessionUid() { return sessionUid; }
        public void setSessionUid(String sessionUid) { this.sessionUid = sessionUid; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public Long getStationId() { return stationId; }
        public void setStationId(Long stationId) { this.stationId = stationId; }
        public String getStationName() { return stationName; }
        public void setStationName(String stationName) { this.stationName = stationName; }
        public Long getChargerId() { return chargerId; }
        public void setChargerId(Long chargerId) { this.chargerId = chargerId; }
        public String getChargerIdentifier() { return chargerIdentifier; }
        public void setChargerIdentifier(String chargerIdentifier) { this.chargerIdentifier = chargerIdentifier; }
        public Long getVehicleId() { return vehicleId; }
        public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
        public String getVehicleModel() { return vehicleModel; }
        public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Boolean getIsSimulated() { return isSimulated; }
        public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }
        public BigDecimal getTariffSnapshotPerKwh() { return tariffSnapshotPerKwh; }
        public void setTariffSnapshotPerKwh(BigDecimal tariffSnapshotPerKwh) { this.tariffSnapshotPerKwh = tariffSnapshotPerKwh; }
        public BigDecimal getEnergyKwh() { return energyKwh; }
        public void setEnergyKwh(BigDecimal energyKwh) { this.energyKwh = energyKwh; }
        public BigDecimal getCurrentPowerKw() { return currentPowerKw; }
        public void setCurrentPowerKw(BigDecimal currentPowerKw) { this.currentPowerKw = currentPowerKw; }
        public BigDecimal getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
        public Long getDurationSeconds() { return durationSeconds; }
        public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }
        public Integer getSocPercentage() { return socPercentage; }
        public void setSocPercentage(Integer socPercentage) { this.socPercentage = socPercentage; }
        public OffsetDateTime getStartedAt() { return startedAt; }
        public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
        public OffsetDateTime getEndedAt() { return endedAt; }
        public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }
        public String getStopReason() { return stopReason; }
        public void setStopReason(String stopReason) { this.stopReason = stopReason; }
    }
}

