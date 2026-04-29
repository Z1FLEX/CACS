package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceCreateDTO {

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number must not exceed 100 characters")
    private String serialNumber;

    @Size(max = 100, message = "Model name must not exceed 100 characters")
    private String modelName;

    @NotNull(message = "Device type is required")
    private DeviceType type;        // Was Integer — wrong. Jackson calls fromString() automatically

    @Pattern(regexp = "ONLINE|OFFLINE", message = "Status must be ONLINE or OFFLINE")
    private String status;          // Optional at creation — defaults to OFFLINE in mapper

    @Size(max = 45, message = "IP address must not exceed 45 characters")
    private String ip;

    @Min(value = 1, message = "Port must be at least 1")
    @Max(value = 65535, message = "Port must not exceed 65535")
    private Integer port;

    @NotNull(message = "Zone is required")
    @Min(value = 1, message = "Zone ID must be positive")
    private Integer zoneId;

    @NotNull(message = "Relay count is required")
    @Min(value = 1, message = "Relay count must be at least 1")
    @Max(value = 64, message = "Relay count cannot exceed 64")
    private Integer relayCount;
}
