package com.hsware.cacs.entity;

import com.hsware.cacs.dto.DeviceType;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20)
    private DeviceType type;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // ONLINE, OFFLINE

    @Column(name = "ip", length = 45)
    private String ip;

    @Column(name = "port")
    private Integer port;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(name = "relay_count", nullable = false)
    private Integer relayCount;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        if (this.status == null) {
            this.status = "OFFLINE";
        }
        if (this.relayCount == null) {
            this.relayCount = 1;
        }
    }
}
