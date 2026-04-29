package com.hsware.cacs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    private String password;
    
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    private String name;
    
    private Set<@NotBlank(message = "Role names must not be blank") @Size(max = 50, message = "Role names must not exceed 50 characters") String> roles = Set.of("USER");
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status must be ACTIVE or INACTIVE")
    private String status = "ACTIVE";
    
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Positive(message = "Card ID must be positive")
    private Integer cardId;
    private Set<@Positive(message = "Profile IDs must be positive") Integer> profileIds;
}
