// com/E205/cocos_forest/domain/ssafy/SsafyLinkage.java
package com.E205.cocos_forest.domain.finance.ssafy;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ssafy_linkages",
       uniqueConstraints = { @UniqueConstraint(name = "uk_ssafy_linkages_user", columnNames = "user_id") })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SsafyLinkage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 우리 서비스의 사용자 PK (FK: users.id)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // SSAFY 키(초기 MVP: 암호화 제외)
    @Column(name = "api_key", nullable = false, length = 64)
    private String apiKey;

    @Column(name = "user_key", nullable = false, length = 64)
    private String userKey;

    // DB default: '00100' / '001' (nullable 허용 후 null이면 저장 시 기본값 유지)
    @Column(name = "institution_code", nullable = false, length = 10)
    private String institutionCode = "00100";

    @Column(name = "fintech_app_no", nullable = false, length = 10)
    private String fintechAppNo = "001";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LinkageStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.institutionCode == null) this.institutionCode = "00100";
        if (this.fintechAppNo == null) this.fintechAppNo = "001";
        if (this.status == null) this.status = LinkageStatus.ACTIVE;
    }

    public enum LinkageStatus {
        ACTIVE, INACTIVE
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
