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
    private String uuid;
    private String uid;
    private String num;
    private String status;
    private Integer userId;
    private String userName;
    
    public AccessCardDTO(Integer id, String uuid, String uid, String num, String status, Integer userId, String userName, Instant createdAt) {
        this.id = id;
        this.uuid = uuid;
        this.uid = uid;
        this.num = num;
        this.status = status;
        this.userId = userId;
        this.userName = userName;
        this.createdAt = createdAt;
    }
}
