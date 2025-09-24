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
 * 숲에 배치된 장식(Decoration) 엔티티
 */
@Entity
@Table(name = "user_decorations",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_user_decorations_forest_cell", columnNames = {"forest_id", "x", "y"})
       })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Decoration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "forest_id", columnDefinition = "BIGINT UNSIGNED", nullable = false)
    private Long forestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forest_id", insertable = false, updatable = false)
    private Forest forest;

    /** 배치 좌표 */
    @Column(nullable = false)
    private Integer x;

    @Column(nullable = false)
    private Integer y;

    /** 에셋 FK (assets.id) */
    @Column(name = "asset_id", columnDefinition = "BIGINT UNSIGNED", nullable = false)
    private Long assetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", insertable = false, updatable = false)
    private Asset asset;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Decoration(Long forestId, Integer x, Integer y, Long assetId) {
        this.forestId = forestId;
        this.x = x;
        this.y = y;
        this.assetId = assetId;
    }

    /** 위치 이동 */
    public void moveTo(int newX, int newY) {
        this.x = newX;
        this.y = newY;
    }
}
