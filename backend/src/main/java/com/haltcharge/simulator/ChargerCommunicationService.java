package com.haltcharge.simulator;

import com.haltcharge.dto.SessionDto;

public interface ChargerCommunicationService {
    void startCharging(Long chargerId, String sessionUid, double maxPowerKw);
    void stopCharging(Long chargerId, String sessionUid);
    void setChargerOffline(Long chargerId);
    void setChargerFault(Long chargerId, String errorDetails);
    void restoreChargerAvailable(Long chargerId);
}

