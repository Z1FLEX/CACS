package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessCardEnrollmentStatusDTO {
    private boolean active;
    private String uid;
    private Long expiresInSeconds;
    private Instant capturedAt;
}
