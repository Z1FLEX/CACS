package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    
    private Integer zoneTypeId;

    /** Set sole zone manager; omit to leave unassigned on create */
    private Integer responsibleUserId;
}
