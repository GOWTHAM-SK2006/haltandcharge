package com.haltcharge.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class Vehicle {
    private Long id;
    private Long userId;
    private String brand;
    private String model;
    private String licensePlate;
    private BigDecimal batteryCapacityKwh;
    private String connectorType;
    private BigDecimal maxChargingSpeedKw;
    private Boolean isDefault;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Vehicle() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public BigDecimal getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(BigDecimal batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }
    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }
    public BigDecimal getMaxChargingSpeedKw() { return maxChargingSpeedKw; }
    public void setMaxChargingSpeedKw(BigDecimal maxChargingSpeedKw) { this.maxChargingSpeedKw = maxChargingSpeedKw; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}

