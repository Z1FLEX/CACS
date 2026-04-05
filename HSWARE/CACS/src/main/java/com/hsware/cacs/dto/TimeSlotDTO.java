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
public class TimeSlotDTO extends BaseDTO {
    private Integer scheduleDayId;
    private Integer dayIndex;
    private String startTime;
    private String endTime;
    
    public TimeSlotDTO(Integer id, Integer scheduleDayId, Integer dayIndex, String startTime, String endTime, Instant createdAt) {
        this.id = id;
        this.scheduleDayId = scheduleDayId;
        this.dayIndex = dayIndex;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdAt = createdAt;
    }
}
