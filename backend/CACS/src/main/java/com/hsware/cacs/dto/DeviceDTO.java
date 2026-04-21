package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO extends BaseDTO {
    private String serialNumber;
    private String modelName;
    private String type;            // Serialized from DeviceType enum — always "READER" / "CONTROLLER" / "LOCK"
    private String status;
    private String ip;
    private Integer port;
    private Instant lastSeenAt;
    private Integer zoneId;
    private String zoneName;
    private Integer relayCount;
    private List<Integer> availableRelayIndices;
}
