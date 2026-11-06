package com.haltcharge.websocket;

import com.haltcharge.dto.SessionDto;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class RealtimeUpdateService {

    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeUpdateService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishChargerStatus(Long chargerId, String identifier, String status) {
        ChargerStatusUpdate update = new ChargerStatusUpdate(chargerId, identifier, status);
        messagingTemplate.convertAndSend("/topic/chargers", update);
        messagingTemplate.convertAndSend("/topic/chargers/" + chargerId, update);
    }

    public void publishSessionUpdate(SessionDto.SessionResponse session) {
        // Send to session specific topic
        messagingTemplate.convertAndSend("/topic/sessions/" + session.getSessionUid(), session);
        // Also send to user specific queue
        messagingTemplate.convertAndSend("/topic/users/" + session.getUserId() + "/session", session);
        // Send to admin live stream
        messagingTemplate.convertAndSend("/topic/admin/live-sessions", session);
    }

    public static class ChargerStatusUpdate {
        private Long chargerId;
        private String identifier;
        private String status;

        public ChargerStatusUpdate(Long chargerId, String identifier, String status) {
            this.chargerId = chargerId;
            this.identifier = identifier;
            this.status = status;
        }

        public Long getChargerId() { return chargerId; }
        public String getIdentifier() { return identifier; }
        public String getStatus() { return status; }
    }
}

