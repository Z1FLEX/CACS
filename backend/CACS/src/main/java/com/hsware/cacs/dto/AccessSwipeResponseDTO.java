package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessSwipeResponseDTO {
    private boolean authorized;
    private AccessDecisionType decision;
    private AccessDecisionReasonCode reasonCode;
    private String reasonMessage;
    private Integer deviceId;
    private Integer doorId;
    private Integer zoneId;
    private Integer userId;
    private String cardUid;
    private Instant occurredAt;
}
