package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO extends BaseDTO {
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private Set<String> roles;
    private String status;
    private String address;
    private Integer cardId;
    private Integer profileId;
    
    public UserDTO(Integer id, String name, String firstName, String lastName, String email, 
                   Set<String> roles, String status, String address, Integer cardId, Integer profileId, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.roles = roles;
        this.status = status;
        this.address = address;
        this.cardId = cardId;
        this.profileId = profileId;
        this.createdAt = createdAt;
    }
}
