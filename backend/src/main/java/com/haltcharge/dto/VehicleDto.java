package com.haltcharge.dto;

import java.math.BigDecimal;

public class VehicleDto {
    public static class VehicleRequest {
        private String brand;
        private String model;
        private String licensePlate;
        private BigDecimal batteryCapacityKwh;
        private String connectorType;
        private BigDecimal maxChargingSpeedKw;
        private Boolean isDefault;

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
    }
}

