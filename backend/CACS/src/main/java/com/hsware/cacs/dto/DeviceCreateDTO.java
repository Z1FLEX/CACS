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

    @NotBlank
    @Size(max = 100)
    private String serialNumber;

    @Size(max = 100)
    private String modelName;

    @NotNull
    private DeviceType type;        // Was Integer — wrong. Jackson calls fromString() automatically

    @Pattern(regexp = "ONLINE|OFFLINE", message = "Status must be ONLINE or OFFLINE")
    private String status;          // Optional at creation — defaults to OFFLINE in mapper

    @Size(max = 45)
    private String ip;

    @Min(1) @Max(65535)
    private Integer port;

    @NotNull
    private Integer zoneId;

    @NotNull
    @Min(1)
    @Max(64)
    private Integer relayCount;
}
