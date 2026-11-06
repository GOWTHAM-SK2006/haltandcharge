# Virtual EV Charger Simulator Guide

## 1. Concept & Architecture

Physical EV chargers are not present during initial software development and demonstrations. To provide a realistic end-to-end platform experience, Halt & Charge incorporates an asynchronous **Virtual Charger Simulator** directly within the backend.

The architecture isolates simulator logic behind the `ChargerCommunicationService` interface:

```
[ ChargingSessionService ]
            │
            ▼
[ ChargerCommunicationService ]  (Interface)
            ├── [ SimulatorChargerService ] (Current Implementation)
            └── [ OcppChargerService ]     (Future physical OCPP 1.6J/2.0.1 driver)
```

## 2. Telemetry Generation Engine

The simulator engine executes on a fixed rate scheduled timer (`@Scheduled(fixedRate = 2000)`):

1. **Power Curve & Ramp-Up**:
   - Chargers start charging at ~85% of peak power capacity.
   - Realistic micro-jitter (+/- 2%) is applied to reproduce grid fluctuations.
   - When vehicle State of Charge (SOC) exceeds 80%, power automatically tapers down by 50% to simulate lithium-ion battery CV (constant voltage) stage charging.

2. **Energy Increment (`kWh`)**:
   - Every 2 seconds, incremental kWh is integrated:
     $$\Delta \text{kWh} = \text{Power (kW)} \times \frac{2}{3600}$$
   - Energy is persisted to `charging_sessions` in PostgreSQL.

3. **Cost Calculation**:
   - Cost is calculated against the tariff snapshot created when the session was initialized:
     $$\text{Estimated Cost} = \text{Energy (kWh)} \times \text{Tariff Snapshot}$$

4. **Real-Time WebSocket Updates**:
   - Each telemetry tick broadcasts the updated session readings to:
     - `/topic/sessions/{sessionUid}`
     - `/topic/users/{userId}/session`
     - `/topic/admin/live-sessions`

## 3. Hardware Fault & State Injections

Admins can inject real-world hardware conditions via the Admin Command Center:
- **Simulate Fault**: Moves charger to `FAULTED` state, halts any active session, and broadcasts `FAULTED` status.
- **Simulate Offline**: Simulates network disconnection, marking the charger `OFFLINE`.
- **Restore Available**: Restores the charger socket to `AVAILABLE` status.

All state transitions are logged to the `simulator_events` table for auditability.

## 4. Distinction from Real Hardware Data

All virtual chargers and sessions have `is_simulated = true`. The user and admin interfaces explicitly render:
`[SIMULATED DATA ONLY - NO FAKE PAYMENTS]`

