package com.hyundai.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_locations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryLocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String address;
}
