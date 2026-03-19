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
    
    public ProfileDTO(Integer id, String name, Integer scheduleId, Set<Integer> zoneIds, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.scheduleId = scheduleId;
        this.zoneIds = zoneIds;
        this.createdAt = createdAt;
    }
}
