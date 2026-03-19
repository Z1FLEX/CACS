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
public class ScheduleDTO extends BaseDTO {
    private String name;
    private String days;
    private String startTime;
    private String endTime;
    private String zones;
    
    public ScheduleDTO(Integer id, String name, String days, String startTime, String endTime, String zones, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.days = days;
        this.startTime = startTime;
        this.endTime = endTime;
        this.zones = zones;
        this.createdAt = createdAt;
    }
}
