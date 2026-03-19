package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DoorCreateDTO {
    private String name;
    private Integer zoneId;
}
