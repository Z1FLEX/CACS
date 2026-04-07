package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class ZoneDTO extends BaseDTO {
    private String name;
    private String location;
    private Integer zoneTypeId;
    private Map<String, Object> zoneType;
    private String manager;
    
    public ZoneDTO(Integer id, String name, String location, Integer zoneTypeId,
                   Map<String, Object> zoneType, String manager, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.zoneTypeId = zoneTypeId;
        this.zoneType = zoneType;
        this.manager = manager;
        this.createdAt = createdAt;
    }
}
