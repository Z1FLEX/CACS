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
public class DeviceDTO extends BaseDTO {
    private String serialNumber;
    private String modelName;
    private Integer type;
    private String status;
    private String ip;
    private Integer port;
    private Instant lastSeenAt;
    private Integer doorId;
    private String doorName;
    
    public DeviceDTO(Integer id, String serialNumber, String modelName, Integer type, String status, 
                     String ip, Integer port, Instant lastSeenAt, Integer doorId, String doorName, Instant createdAt) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.modelName = modelName;
        this.type = type;
        this.status = status;
        this.ip = ip;
        this.port = port;
        this.lastSeenAt = lastSeenAt;
        this.doorId = doorId;
        this.doorName = doorName;
        this.createdAt = createdAt;
    }
}
