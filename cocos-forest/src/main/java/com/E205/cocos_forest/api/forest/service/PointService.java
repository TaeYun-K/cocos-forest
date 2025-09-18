package com.E205.cocos_forest.api.forest.service;

import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        return user.getCurrentBalance();
    }

    /**
     * 포인트 사용 (원자적 처리)
     */
    @Transactional
    public void spendPoints(Long userId, Integer points, String reason, Long refId, String description) {
        // 입력값 검증
        if (points == null || points <= 0) {
            throw new BaseException(BaseResponseStatus.INVALID_POINTS_AMOUNT, "포인트는 양수여야 합니다.");
        }

        // 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        // 잔액 확인
        if (user.getCurrentBalance() < points) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_POINTS,
                String.format("포인트가 부족합니다. 현재: %d, 필요: %d", user.getCurrentBalance(), points));
        }

        // 새로운 잔액 계산
        Long newBalance = user.getCurrentBalance() - points;

        try {
            // 1. users 테이블의 current_balance 업데이트 (동시성 처리)
            int updatedRows = jdbcTemplate.update(
                "UPDATE users SET current_balance = ?, updated_at = ? WHERE id = ? AND current_balance >= ?",
                newBalance, LocalDateTime.now(), userId, points);

            if (updatedRows == 0) {
                throw new BaseException(BaseResponseStatus.POINTS_CONCURRENCY_ERROR,
                    "다른 작업에 의해 포인트가 변경되었습니다. 다시 시도해주세요.");
            }

            // 2. points_ledger에 사용 내역 기록
            recordPointsTransaction(userId, points, newBalance, "SPEND", reason, refId, description);

            log.info("사용자 {}가 {}포인트를 사용했습니다. 사유: {}, 잔액: {}",
                userId, points, description, newBalance);

        } catch (DataIntegrityViolationException e) {
            log.error("포인트 사용 중 데이터 무결성 오류 발생: {}", e.getMessage());
            throw new BaseException(BaseResponseStatus.POINTS_LEDGER_ERROR,
                "포인트 사용 내역 기록 중 오류가 발생했습니다.");
        } catch (Exception e) {
            log.error("포인트 사용 중 예기치 않은 오류 발생: {}", e.getMessage());
            throw new BaseException(BaseResponseStatus.POINTS_TRANSACTION_FAILED,
                "포인트 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 포인트 지급 (챌린지 보상, 나무 보상 등)
     */
    @Transactional
    public void earnPoints(Long userId, Integer points, String reason, Long refId, String description) {
        // 입력값 검증
        if (points == null || points <= 0) {
            throw new BaseException(BaseResponseStatus.INVALID_POINTS_AMOUNT, "포인트는 양수여야 합니다.");
        }

        // 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        // 새로운 잔액 계산
        Long newBalance = user.getCurrentBalance() + points;

        try {
            // 1. users 테이블의 current_balance 업데이트
            jdbcTemplate.update(
                "UPDATE users SET current_balance = ?, updated_at = ? WHERE id = ?",
                newBalance, LocalDateTime.now(), userId);

            // 2. points_ledger에 획득 내역 기록
            recordPointsTransaction(userId, points, newBalance, "EARN", reason, refId, description);

            log.info("사용자 {}가 {}포인트를 획득했습니다. 사유: {}, 잔액: {}",
                userId, points, description, newBalance);

        } catch (DataIntegrityViolationException e) {
            log.error("포인트 지급 중 데이터 무결성 오류 발생: {}", e.getMessage());
            throw new BaseException(BaseResponseStatus.POINTS_LEDGER_ERROR,
                "포인트 지급 내역 기록 중 오류가 발생했습니다.");
        } catch (Exception e) {
            log.error("포인트 지급 중 예기치 않은 오류 발생: {}", e.getMessage());
            throw new BaseException(BaseResponseStatus.POINTS_TRANSACTION_FAILED,
                "포인트 처리 중 오류가 발생했습니다.");
        }
    }

    /**
     * 완전 성장 나무 일일 보상 지급 (배치 작업용)
     */
    @Transactional
    public void giveTreeRewards(Long userId, Integer treeCount) {
        if (treeCount == null || treeCount <= 0) {
            log.warn("잘못된 나무 개수입니다. userId: {}, treeCount: {}", userId, treeCount);
            return;
        }

        Integer totalPoints = treeCount * 50; // 나무당 50포인트
        earnPoints(userId, totalPoints, "TREE_REWARD", 0L,
            "완전 성장 나무 " + treeCount + "그루 일일 보상");
    }

    /**
     * 포인트 거래 내역 기록 (공통 메서드)
     */
    private void recordPointsTransaction(Long userId, Integer points, Long balanceAfter,
        String entryType, String reason, Long refId, String description) {
        try {
            String entryId = UUID.randomUUID().toString();
            String idempotencyKey = generateIdempotencyKey(userId, reason, refId);

            jdbcTemplate.update(
                "INSERT INTO points_ledger " +
                    "(entry_id, user_id, entry_type, points, balance_after, source, title, description, " +
                    "reference_type, reference_id, occurred_at, created_at, idempotency_key) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                entryId, userId, entryType, points, balanceAfter, "FOREST_GAME",
                getTransactionTitle(entryType, reason), description, reason, refId.toString(),
                LocalDateTime.now(), LocalDateTime.now(), idempotencyKey);

        } catch (Exception e) {
            log.error("포인트 거래 내역 기록 실패: userId={}, entryType={}, points={}",
                userId, entryType, points, e);
            throw new BaseException(BaseResponseStatus.POINTS_LEDGER_ERROR,
                "포인트 거래 내역 기록에 실패했습니다.");
        }
    }

    /**
     * 멱등성 키 생성
     */
    private String generateIdempotencyKey(Long userId, String reason, Long refId) {
        return String.format("%d_%s_%d_%d", userId, reason, refId, System.currentTimeMillis());
    }

    /**
     * 거래 제목 생성
     */
    private String getTransactionTitle(String entryType, String reason) {
        if ("SPEND".equals(entryType)) {
            return getPointSpendTitle(reason);
        } else if ("EARN".equals(entryType)) {
            return getPointEarnTitle(reason);
        }
        return "포인트 거래";
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