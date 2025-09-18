package com.E205.cocos_forest.domain.forest.entity;

import com.E205.cocos_forest.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 사용자의 숲 정보를 담는 엔티티
 */
@Entity
@Table(name = "forests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Forest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "user_id", columnDefinition = "BIGINT UNSIGNED", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(nullable = false)
    private Integer size = 8; // 기본 숲 크기

    @Column(name = "pond_x", nullable = false)
    private Integer pondX = 3; // 연못 중심 x좌표

    @Column(name = "pond_y", nullable = false)
    private Integer pondY = 3; // 연못 중심 y좌표

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 양방향 관계 설정 (숲에 속한 나무들)
    @OneToMany(mappedBy = "forest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tree> trees = new ArrayList<>();

    @Builder
    public Forest(Long userId, Integer size, Integer pondX, Integer pondY) {
        this.userId = userId;
        this.size = size != null ? size : 8;
        this.pondX = pondX != null ? pondX : calculateDefaultPondX(this.size);
        this.pondY = pondY != null ? pondY : calculateDefaultPondY(this.size);
    }

    /**
     * 숲 크기 확장
     */
    public void expandSize() {
        this.size += 2; // 8 -> 10 -> 12 ...
        // 연못을 새로운 중앙으로 이동
        this.pondX = calculateDefaultPondX(this.size);
        this.pondY = calculateDefaultPondY(this.size);
    }

    /**
     * 연못 위치 이동
     */
    public void movePond(int newX, int newY) {
        // 경계 체크 (연못은 경계에서 최소 1칸 떨어져야 함)
        if (isValidPondPosition(newX, newY)) {
            this.pondX = newX;
            this.pondY = newY;
        } else {
            throw new IllegalArgumentException("연못 위치가 유효하지 않습니다.");
        }
    }

    /**
     * 기본 연못 X 좌표 계산
     */
    private int calculateDefaultPondX(int forestSize) {
        return forestSize / 2 - 1;
    }

    /**
     * 기본 연못 Y 좌표 계산
     */
    private int calculateDefaultPondY(int forestSize) {
        return forestSize / 2 - 1;
    }

    /**
     * 연못 위치 유효성 검증
     */
    private boolean isValidPondPosition(int x, int y) {
        // 연못은 2x2 크기이므로, (x,y) ~ (x+1,y+1) 영역이 모두 숲 내부에 있어야 함
        // 경계에서 최소 1칸 떨어져야 함
        return x >= 1 && y >= 1 && x + 1 < size - 1 && y + 1 < size - 1;
    }

    /**
     * 특정 좌표가 연못 영역인지 확인
     */
    public boolean isPondArea(int x, int y) {
        return x >= pondX && x <= pondX + 1 && y >= pondY && y <= pondY + 1;
    }

    /**
     * 특정 좌표에 나무를 심을 수 있는지 확인
     */
    public boolean canPlantTree(int x, int y) {
        // 숲 범위 내에 있고, 연못이 아니며, 이미 나무가 없어야 함
        return x >= 0 && x < size && y >= 0 && y < size 
               && !isPondArea(x, y)
               && trees.stream().noneMatch(tree -> tree.getX() == x && tree.getY() == y);
    }
}
