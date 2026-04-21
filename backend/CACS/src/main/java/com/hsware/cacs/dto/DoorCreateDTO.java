package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoorCreateDTO {
    @NotBlank
    private String name;

    @NotNull
    private Integer zoneId;

    private String location;
    private Integer deviceId;
    private Integer relayIndex;
}
