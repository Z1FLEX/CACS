package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoorUpdateDTO {
    private String name;
    private Integer zoneId;
    private String location;
    private Integer deviceId;
    private Integer relayIndex;
}
