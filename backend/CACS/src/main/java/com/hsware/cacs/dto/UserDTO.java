package com.hsware.cacs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO extends BaseDTO {
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String status;
    private String address;
    private Integer cardId;
    private Integer profileId;
    
    public UserDTO(Integer id, String name, String firstName, String lastName, String email, 
                   String role, String status, String address, Integer cardId, Integer profileId, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.address = address;
        this.cardId = cardId;
        this.profileId = profileId;
        this.createdAt = createdAt;
    }
}
