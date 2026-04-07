package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDTO {
    @NotBlank(message = "Profile name is required")
    @Size(max = 100, message = "Profile name must not exceed 100 characters")
    private String name;

    @NotEmpty(message = "At least one schedule must be assigned")
    private Set<Integer> scheduleIds;

    @NotEmpty(message = "At least one zone must be assigned")
    private Set<Integer> zoneIds;
}
