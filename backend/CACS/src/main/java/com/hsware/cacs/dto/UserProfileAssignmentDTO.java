package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileAssignmentDTO {
    @NotNull(message = "Profile assignment payload is required")
    private Set<@Positive(message = "Profile IDs must be positive") Integer> profileIds;
}
