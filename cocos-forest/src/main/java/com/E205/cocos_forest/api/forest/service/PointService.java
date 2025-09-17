package com.E205.cocos_forest.api.forest.service;

import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 포인트 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PointService {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 사용자 현재 포인트 조회
     */
    public Long getCurrentPoints(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return user.getCurrentBalance();
    }

    /**
     * 포인트 사용 (원자적 처리)
     */
    @Transactional
    public void spendPoints(Long userId, Integer points, String reason, Long refId, String description) {
        // 사용자 조회 및 잔액 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (user.getCurrentBalance() < points) {
            throw new IllegalArgumentException("포인트가 부족합니다. " +
                    "현재: " + user.getCurrentBalance() + ", 필요: " + points);
        }

        // 새로운 잔액 계산
        Long newBalance = user.getCurrentBalance() - points;

        // 1. users 테이블의 current_balance 업데이트
        int updatedRows = jdbcTemplate.update(
                "UPDATE users SET current_balance = ?, updated_at = ? WHERE id = ? AND current_balance >= ?",
                newBalance, LocalDateTime.now(), userId, points);

        if (updatedRows == 0) {
            throw new IllegalStateException("포인트 차감 실패 (동시성 이슈 가능성)");
        }

        // 2. points_ledger에 사용 내역 기록
        String entryId = UUID.randomUUID().toString();
        String idempotencyKey = userId + "_" + reason + "_" + refId + "_" + System.currentTimeMillis();
        
        jdbcTemplate.update(
                "INSERT INTO points_ledger " +
                "(entry_id, user_id, entry_type, points, balance_after, source, title, description, " +
                "reference_type, reference_id, occurred_at, created_at, idempotency_key) " +
                "VALUES (?, ?, 'SPEND', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                entryId, userId, -points, newBalance, "FOREST_GAME", 
                getPointSpendTitle(reason), description, reason, refId.toString(),
                LocalDateTime.now(), LocalDateTime.now(), idempotencyKey);

        log.info("사용자 {}가 {}포인트를 사용했습니다. 사유: {}, 잔액: {}", 
                userId, points, description, newBalance);
    }

    /**
     * 포인트 지급 (챌린지 보상, 나무 보상 등)
     */
    @Transactional
    public void earnPoints(Long userId, Integer points, String reason, Long refId, String description) {
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 새로운 잔액 계산
        Long newBalance = user.getCurrentBalance() + points;

        // 1. users 테이블의 current_balance 업데이트
        jdbcTemplate.update(
                "UPDATE users SET current_balance = ?, updated_at = ? WHERE id = ?",
                newBalance, LocalDateTime.now(), userId);

        // 2. points_ledger에 획득 내역 기록
        String entryId = UUID.randomUUID().toString();
        String idempotencyKey = userId + "_" + reason + "_" + refId + "_" + System.currentTimeMillis();
        
        jdbcTemplate.update(
                "INSERT INTO points_ledger " +
                "(entry_id, user_id, entry_type, points, balance_after, source, title, description, " +
                "reference_type, reference_id, occurred_at, created_at, idempotency_key) " +
                "VALUES (?, ?, 'EARN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                entryId, userId, points, newBalance, "FOREST_GAME", 
                getPointEarnTitle(reason), description, reason, refId.toString(),
                LocalDateTime.now(), LocalDateTime.now(), idempotencyKey);

        log.info("사용자 {}가 {}포인트를 획득했습니다. 사유: {}, 잔액: {}", 
                userId, points, description, newBalance);
    }

    /**
     * 완전 성장 나무 일일 보상 지급 (배치 작업용)
     */
    @Transactional
    public void giveTreeRewards(Long userId, Integer treeCount) {
        if (treeCount <= 0) return;

        Integer totalPoints = treeCount * 50; // 나무당 50포인트
        earnPoints(userId, totalPoints, "TREE_REWARD", 0L, 
                "완전 성장 나무 " + treeCount + "그루 일일 보상");
    }

    /**
     * 포인트 사용 제목 생성
     */
    private String getPointSpendTitle(String reason) {
        return switch (reason) {
            case "PLANT" -> "나무 심기";
            case "WATER" -> "물주기";
            case "EXPAND" -> "숲 확장";
            default -> "숲 게임 사용";
        };
    }

    /**
     * 포인트 획득 제목 생성
     */
    private String getPointEarnTitle(String reason) {
        return switch (reason) {
            case "TREE_REWARD" -> "나무 일일 보상";
            case "CHALLENGE_REWARD" -> "챌린지 보상";
            default -> "숲 게임 보상";
        };
    }
}