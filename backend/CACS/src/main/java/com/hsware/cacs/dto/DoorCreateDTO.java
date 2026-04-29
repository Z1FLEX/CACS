package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoorCreateDTO {
    @NotBlank(message = "Door name is required")
    @Size(max = 100, message = "Door name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Zone is required")
    @Positive(message = "Zone ID must be positive")
    private Integer zoneId;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Positive(message = "Device ID must be positive")
    private Integer deviceId;

    @Positive(message = "Relay index must be positive")
    private Integer relayIndex;
}
