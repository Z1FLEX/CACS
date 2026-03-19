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
public class AccessCardDTO extends BaseDTO {
    private String uid;
    private String num;
    private String status;
    
    public AccessCardDTO(Integer id, String uid, String num, String status, Instant createdAt) {
        this.id = id;
        this.uid = uid;
        this.num = num;
        this.status = status;
        this.createdAt = createdAt;
    }
}
