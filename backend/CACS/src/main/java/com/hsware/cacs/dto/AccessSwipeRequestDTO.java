package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessSwipeRequestDTO {

    @NotNull(message = "Device ID is required")
    private Integer deviceId;

    @NotNull(message = "Door ID is required")
    private Integer doorId;

    @NotBlank(message = "Card UID is required")
    private String cardUid;

    private Instant occurredAt;
}
