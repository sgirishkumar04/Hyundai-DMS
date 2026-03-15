package com.hyundai.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "leads",
    indexes = {
        @Index(columnList = "status"),
        @Index(columnList = "assigned_to"),
        @Index(columnList = "customer_id")
    })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Lead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lead_number", nullable = false, unique = true, length = 20)
    private String leadNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_id", nullable = false)
    private LeadSource source;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to", nullable = false)
    private Employee assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_model_id")
    private VehicleModel preferredModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_variant_id")
    private VehicleVariant preferredVariant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_color_id")
    private Color preferredColor;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeadStatus status = LeadStatus.NEW;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "expected_close_date")
    private LocalDate expectedCloseDate;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum LeadStatus {
        NEW, CONTACTED, TEST_DRIVE, NEGOTIATION, BOOKED, LOST, DELIVERED
    }
}
