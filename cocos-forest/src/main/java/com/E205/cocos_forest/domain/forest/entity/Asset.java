package com.E205.cocos_forest.domain.forest.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 배치 가능한 장식(에셋) 정의 테이블: assets
 */
@Entity
@Table(name = "assets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    /** 카테고리 FK */
    @Column(name = "category_id", columnDefinition = "BIGINT UNSIGNED", nullable = false)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private AssetCategory category;

    /** 포인트 가격 (없으면 0) */
    @Column(name = "price_points", nullable = false)
    private Integer pricePoints = 0;

    /** 프론트에서 스프라이트 매핑용 키(예: FLOWERS_DARK) */
    @Column(name = "sprite_key", length = 100)
    private String spriteKey;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Asset(String name, Long categoryId, Integer pricePoints, String spriteKey, Boolean active) {
        this.name = name;
        this.categoryId = categoryId;
        this.pricePoints = pricePoints != null ? pricePoints : 0;
        this.spriteKey = spriteKey;
        this.active = active != null ? active : true;
    }
}
