package com.hsware.cacs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "device")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "type")
    private Integer type;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // ONLINE, OFFLINE

    @Column(name = "ip", length = 45)
    private String ip;

    @Column(name = "port")
    private Integer port;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "door_id", nullable = false)
    private Door door;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    private Instant createdAt;
}
