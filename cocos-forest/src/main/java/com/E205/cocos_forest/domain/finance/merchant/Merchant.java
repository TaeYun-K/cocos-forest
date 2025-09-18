package com.E205.cocos_forest.domain.finance.merchant;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "merchants",
    indexes = {
        @Index(name = "idx_merch_category", columnList = "category_id")
    })
@Getter
@Setter
@NoArgsConstructor
public class Merchant {

    @Id
    // Not using @GeneratedValue because DDL indicates externally assigned IDs
    private Long id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "category_id", nullable = false, length = 32)
    private String categoryId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

