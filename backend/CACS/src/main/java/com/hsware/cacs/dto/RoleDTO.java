package com.hsware.cacs.dto;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.Instant;

@lombok.Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class RoleDTO extends BaseDTO {
    private String name;
    private String description;

    public RoleDTO(Integer id, String name, String description, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }
}
