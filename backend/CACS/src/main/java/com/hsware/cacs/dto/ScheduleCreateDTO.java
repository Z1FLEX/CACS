package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ScheduleCreateDTO {
    @NotBlank(message = "Schedule name is required")
    @Size(max = 100, message = "Schedule name must not exceed 100 characters")
    private String name;
}
