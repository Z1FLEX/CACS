package com.hsware.cacs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "access_card")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "uid", length = 100)
    private String uid;

    @Column(name = "num", nullable = false, length = 64)
    private String num;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // ACTIVE, INACTIVE, REVOKED

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
