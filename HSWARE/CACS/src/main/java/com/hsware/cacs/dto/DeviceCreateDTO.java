package com.hsware.cacs.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer type;

    @Pattern(regexp = "ONLINE|OFFLINE")
    private String status;

    @Size(max = 45)
    private String ip;

    @Min(1)
    @Max(65535)
    private Integer port;

    private List<Integer> doorIds;
}
