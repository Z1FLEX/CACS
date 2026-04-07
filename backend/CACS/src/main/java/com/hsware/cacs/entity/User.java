package com.hsware.cacs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "gender")
    private Integer gender;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "role", nullable = false, length = 30)
    private String role; // ADMIN, RESPONSABLE, USER

    @Column(name = "status", nullable = false, length = 20)
    private String status; // ACTIVE, INACTIVE

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "access_card_id", unique = true)
    private AccessCard accessCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id")
    private Photo photo;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "zone_responsibility",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "zone_id")
    )
    @Builder.Default
    private Set<Zone> responsibleZones = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
