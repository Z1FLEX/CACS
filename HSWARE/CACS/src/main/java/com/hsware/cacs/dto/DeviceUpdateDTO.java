package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceUpdateDTO {

    private String serialNumber;
    private String modelName;
    private Integer type;
    private String status;
    private String ip;
    private Integer port;

    private List<Integer> doorIds;
}
