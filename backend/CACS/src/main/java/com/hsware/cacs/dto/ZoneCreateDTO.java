package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZoneCreateDTO {
    @NotBlank(message = "Zone name is required")
    @Size(max = 100, message = "Zone name must not exceed 100 characters")
    private String name;
    
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @NotNull(message = "Zone type is required")
    @Positive(message = "Zone type ID must be positive")
    private Integer zoneTypeId;

    /** Set sole zone manager; omit to leave unassigned on create */
    @Positive(message = "Responsible user ID must be positive")
    private Integer responsibleUserId;
}
