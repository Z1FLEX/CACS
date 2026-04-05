package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TimeSlotCreateDTO {
    private Integer dayIndex;
    private String startTime;
    private String endTime;
}
