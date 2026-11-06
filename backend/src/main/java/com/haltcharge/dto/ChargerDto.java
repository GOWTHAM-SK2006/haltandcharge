package com.haltcharge.dto;

import java.math.BigDecimal;

public class ChargerDto {
    public static class ChargerResponse {
        private Long id;
        private Long stationId;
        private String identifier;
        private String name;
        private String chargerType;
        private BigDecimal maxPowerKw;
        private String status;
        private BigDecimal tariffPerKwh;
        private Boolean isSimulated;
        private Boolean isActive;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getStationId() { return stationId; }
        public void setStationId(Long stationId) { this.stationId = stationId; }
        public String getIdentifier() { return identifier; }
        public void setIdentifier(String identifier) { this.identifier = identifier; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getChargerType() { return chargerType; }
        public void setChargerType(String chargerType) { this.chargerType = chargerType; }
        public BigDecimal getMaxPowerKw() { return maxPowerKw; }
        public void setMaxPowerKw(BigDecimal maxPowerKw) { this.maxPowerKw = maxPowerKw; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getTariffPerKwh() { return tariffPerKwh; }
        public void setTariffPerKwh(BigDecimal tariffPerKwh) { this.tariffPerKwh = tariffPerKwh; }
        public Boolean getIsSimulated() { return isSimulated; }
        public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }

    public static class CreateChargerRequest {
        private Long stationId;
        private String identifier;
        private String name;
        private String chargerType;
        private BigDecimal maxPowerKw;
        private BigDecimal tariffPerKwh;
        private Boolean isSimulated = true;

        public Long getStationId() { return stationId; }
        public void setStationId(Long stationId) { this.stationId = stationId; }
        public String getIdentifier() { return identifier; }
        public void setIdentifier(String identifier) { this.identifier = identifier; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getChargerType() { return chargerType; }
        public void setChargerType(String chargerType) { this.chargerType = chargerType; }
        public BigDecimal getMaxPowerKw() { return maxPowerKw; }
        public void setMaxPowerKw(BigDecimal maxPowerKw) { this.maxPowerKw = maxPowerKw; }
        public BigDecimal getTariffPerKwh() { return tariffPerKwh; }
        public void setTariffPerKwh(BigDecimal tariffPerKwh) { this.tariffPerKwh = tariffPerKwh; }
        public Boolean getIsSimulated() { return isSimulated; }
        public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }
    }
}

