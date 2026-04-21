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
public class DoorDTO extends BaseDTO {
    private String name;
    private Integer zoneId;
    private String zoneName;
    private String location;
    private Integer deviceId;
    private String deviceName;
    private Integer relayIndex;
    
    public DoorDTO(Integer id, String name, Integer zoneId, String zoneName, String location, Integer deviceId, String deviceName, Integer relayIndex, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.location = location;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.relayIndex = relayIndex;
        this.createdAt = createdAt;
    }
}
