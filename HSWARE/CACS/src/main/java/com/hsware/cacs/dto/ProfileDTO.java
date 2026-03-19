package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO extends BaseDTO {
    private String name;
    private Integer scheduleId;
    private Set<Integer> zoneIds;
    private String description;
    private Integer permissions;
    
    public ProfileDTO(Integer id, String name, Integer scheduleId, Set<Integer> zoneIds, String description, Integer permissions, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.scheduleId = scheduleId;
        this.zoneIds = zoneIds;
        this.description = description;
        this.permissions = permissions;
        this.createdAt = createdAt;
    }
}
