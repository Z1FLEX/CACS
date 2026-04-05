package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TimeSlotUpdateDTO {
    private Integer dayIndex;
    private String startTime;
    private String endTime;
}
