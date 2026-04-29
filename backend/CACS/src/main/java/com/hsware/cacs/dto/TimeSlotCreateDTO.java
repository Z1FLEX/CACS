package com.hsware.cacs.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TimeSlotCreateDTO {
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotNull(message = "Day index is required")
    @Min(value = 1, message = "Day index must be between 1 and 7")
    @Max(value = 7, message = "Day index must be between 1 and 7")
    private Integer dayIndex;

    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$", message = "Start time must be HH:mm or HH:mm:ss")
    private String startTime;

    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$", message = "End time must be HH:mm or HH:mm:ss")
    private String endTime;
}
