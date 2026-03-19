package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class DoorDTO extends BaseDTO {
    private String name;
    private Integer zoneId;
    private String zoneName;
    
    public DoorDTO(Integer id, String name, Integer zoneId, String zoneName, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.createdAt = createdAt;
    }
}
