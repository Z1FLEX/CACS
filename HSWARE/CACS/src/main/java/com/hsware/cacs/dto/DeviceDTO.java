package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO extends BaseDTO {

    private String serialNumber;
    private String modelName;
    private String type;
    private String status;
    private String ip;
    private Integer port;
    private Instant lastSeenAt;

    private List<Integer> doorIds;
    private List<String> doorNames;
}
