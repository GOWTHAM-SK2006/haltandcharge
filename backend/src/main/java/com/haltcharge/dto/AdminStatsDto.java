package com.haltcharge.dto;

import java.math.BigDecimal;

public class AdminStatsDto {
    private Long totalUsers;
    private Long totalStations;
    private Long totalChargers;
    private Long availableChargers;
    private Long chargingChargers;
    private Long offlineChargers;
    private Long faultedChargers;
    private Long activeSessions;
    private Long completedSessions;
    private BigDecimal simulatedEnergyKwh;
    private BigDecimal simulatedRevenue;

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public Long getTotalStations() { return totalStations; }
    public void setTotalStations(Long totalStations) { this.totalStations = totalStations; }
    public Long getTotalChargers() { return totalChargers; }
    public void setTotalChargers(Long totalChargers) { this.totalChargers = totalChargers; }
    public Long getAvailableChargers() { return availableChargers; }
    public void setAvailableChargers(Long availableChargers) { this.availableChargers = availableChargers; }
    public Long getChargingChargers() { return chargingChargers; }
    public void setChargingChargers(Long chargingChargers) { this.chargingChargers = chargingChargers; }
    public Long getOfflineChargers() { return offlineChargers; }
    public void setOfflineChargers(Long offlineChargers) { this.offlineChargers = offlineChargers; }
    public Long getFaultedChargers() { return faultedChargers; }
    public void setFaultedChargers(Long faultedChargers) { this.faultedChargers = faultedChargers; }
    public Long getActiveSessions() { return activeSessions; }
    public void setActiveSessions(Long activeSessions) { this.activeSessions = activeSessions; }
    public Long getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(Long completedSessions) { this.completedSessions = completedSessions; }
    public BigDecimal getSimulatedEnergyKwh() { return simulatedEnergyKwh; }
    public void setSimulatedEnergyKwh(BigDecimal simulatedEnergyKwh) { this.simulatedEnergyKwh = simulatedEnergyKwh; }
    public BigDecimal getSimulatedRevenue() { return simulatedRevenue; }
    public void setSimulatedRevenue(BigDecimal simulatedRevenue) { this.simulatedRevenue = simulatedRevenue; }
}

