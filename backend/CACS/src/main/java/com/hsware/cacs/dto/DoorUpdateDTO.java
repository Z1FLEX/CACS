package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DoorUpdateDTO {
    private String name;
    private Integer zoneId;
    private String location;
}
