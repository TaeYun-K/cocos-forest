package com.E205.cocos_forest.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * @Entity: 이 클래스가 데이터베이스의 테이블과 매핑되는 JPA 엔티티임을 나타냅니다.
 *
 * @Table(name = "users"): users 테이블과 매핑됨을 명시합니다. 클래스명과 테이블명이 같다면 생략 가능합니다.
 *
 * @Getter: Lombok 어노테이션으로, 모든 필드의 getter 메서드를 자동으로 생성해줍니다.
 *
 * @NoArgsConstructor(access = AccessLevel.PROTECTED): JPA는 엔티티 객체를 생성할 때 기본 생성자를 사용합니다. 무분별한 객체 생성을 막기 위해 접근 제어 수준을 protected로 설정합니다.
 *
 * @Id: 해당 필드가 테이블의 Primary Key(PK)임을 나타냅니다.
 *
 * @GeneratedValue(strategy = GenerationType.IDENTITY): PK 값을 데이터베이스에 위임하여 자동 생성합니다 (예: MySQL의 AUTO_INCREMENT).
 *
 * @Column(...): 필드가 테이블의 컬럼과 매핑됨을 나타냅니다. nullable, length, unique 등 SQL 제약조건을 설정할 수 있습니다. columnDefinition으로 직접 컬럼 타입을 지정할 수도 있습니다.
 *
 * @CreationTimestamp / @UpdateTimestamp: 데이터가 생성되거나 업데이트될 때 현재 시각을 자동으로 저장해주는 편리한 어노테이션입니다.
 *
 * @Builder: 빌더 패턴을 사용하여 객체를 안전하고 편리하게 생성할 수 있게 해줍니다. new User(...) 대신 User.builder().email(...).build() 형태로 사용합니다.
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(nullable = false, length = 50, unique = true)
    private String nickname;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private LocalDateTime termsAgreedAt;

    @Column(nullable = false)
    private LocalDateTime privacyPolicyAgreedAt;

    private LocalDateTime marketingAgreedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Enumerated(EnumType.STRING) // Enum 타입을 DB에 저장할 때 문자열(예: "USER")로 저장
    @Column(nullable = false, length = 20)
    private Role role;

    @Builder
    public User(String email, String nickname, String password, String phoneNumber,
        LocalDateTime termsAgreedAt, LocalDateTime privacyPolicyAgreedAt,
        LocalDateTime marketingAgreedAt, Role role) {
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.termsAgreedAt = termsAgreedAt;
        this.privacyPolicyAgreedAt = privacyPolicyAgreedAt;
        this.marketingAgreedAt = marketingAgreedAt;
        this.role = role != null ? role : Role.USER;
    }
}