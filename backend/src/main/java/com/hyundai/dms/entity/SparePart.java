package com.hyundai.dms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "spare_parts",
    indexes = {
        @Index(columnList = "category"),
        @Index(columnList = "supplier_id")
    })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SparePart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_number", nullable = false, unique = true, length = 50)
    private String partNumber;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 80)
    private String category;

    @Column(length = 20)
    private String unit = "Piece";

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "gst_rate", precision = 5, scale = 2)
    private BigDecimal gstRate = new BigDecimal("18.00");

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
