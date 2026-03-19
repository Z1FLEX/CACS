package com.hsware.cacs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessCardCreateDTO {
    @NotBlank(message = "UID is required")
    @Size(max = 100, message = "UID must not exceed 100 characters")
    private String uid;
    
    @Size(max = 100, message = "Card number must not exceed 100 characters")
    private String num;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE|REVOKED)$", message = "Status must be ACTIVE, INACTIVE, or REVOKED")
    private String status = "ACTIVE";
}
