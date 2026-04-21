package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceUpdateDTO {

    private String serialNumber;
    private String modelName;
    private DeviceType type;
    private String status;
    private String ip;
    private Integer port;
    private Integer zoneId;
    private Integer relayCount;
}
