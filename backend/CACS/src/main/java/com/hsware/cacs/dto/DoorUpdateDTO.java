package com.hsware.cacs.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoorUpdateDTO {
    @Size(max = 100, message = "Door name must not exceed 100 characters")
    private String name;

    @Positive(message = "Zone ID must be positive")
    private Integer zoneId;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Positive(message = "Device ID must be positive")
    private Integer deviceId;

    @Positive(message = "Relay index must be positive")
    private Integer relayIndex;
}
