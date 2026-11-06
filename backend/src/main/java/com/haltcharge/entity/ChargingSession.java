package com.haltcharge.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class ChargingSession {
    private Long id;
    private String sessionUid;
    private Long userId;
    private Long stationId;
    private Long chargerId;
    private Long vehicleId;
    private String status; // IN_PROGRESS, COMPLETED, STOPPED_BY_USER, FAULTED, CANCELLED
    private Boolean isSimulated;
    private BigDecimal tariffSnapshotPerKwh;
    private BigDecimal energyKwh;
    private BigDecimal currentPowerKw;
    private BigDecimal estimatedCost;
    private Long durationSeconds;
    private OffsetDateTime startedAt;
    private OffsetDateTime endedAt;
    private String stopReason;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public ChargingSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSessionUid() { return sessionUid; }
    public void setSessionUid(String sessionUid) { this.sessionUid = sessionUid; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }
    public Long getChargerId() { return chargerId; }
    public void setChargerId(Long chargerId) { this.chargerId = chargerId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
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
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime startedAt) { this.startedAt = startedAt; }
    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime endedAt) { this.endedAt = endedAt; }
    public String getStopReason() { return stopReason; }
    public void setStopReason(String stopReason) { this.stopReason = stopReason; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}

