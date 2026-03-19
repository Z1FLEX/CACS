package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCreateDTO {
    @NotBlank(message = "Profile name is required")
    @Size(max = 100, message = "Profile name must not exceed 100 characters")
    private String name;
    
    private Integer scheduleId;
    private Set<Integer> zoneIds;
}
