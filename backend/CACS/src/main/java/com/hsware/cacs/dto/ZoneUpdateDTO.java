package com.hsware.cacs.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ZoneUpdateDTO {
    @Size(max = 100, message = "Zone name must not exceed 100 characters")
    private String name;
    
    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;
    
    private Integer zoneTypeId;

    /** 0 = clear managers; positive id = set sole manager; omit = no change */
    private Integer responsibleUserId;
}
