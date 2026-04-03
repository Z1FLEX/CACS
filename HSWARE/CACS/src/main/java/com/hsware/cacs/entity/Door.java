package com.hsware.cacs.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "door")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Door {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = true)
    private Zone zone;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToMany(mappedBy = "doors", fetch = FetchType.LAZY)
    @JsonBackReference("device-doors")
    private Set<Device> devices = new HashSet<>();
}
