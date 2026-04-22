package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileAssignmentDTO {
    @NotNull(message = "Profile assignment payload is required")
    private Set<Integer> profileIds;
}
