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
public class ZoneDTO extends BaseDTO {
    private String name;
    private String location;
    private Integer zoneTypeId;
    
    public ZoneDTO(Integer id, String name, String location, Integer zoneTypeId, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.zoneTypeId = zoneTypeId;
        this.createdAt = createdAt;
    }
}
