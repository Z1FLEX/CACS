package com.hsware.cacs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    @Email(message = "Email should be valid")
    private String email;
    
    private String password;
    
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    private String name;
    
    @Pattern(regexp = "^(ADMIN|RESPONSABLE|USER)$", message = "Role must be ADMIN, RESPONSABLE, or USER")
    private String role;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status must be ACTIVE or INACTIVE")
    private String status;
    
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;
    
    private Integer cardId;
    private Integer profileId;
}
