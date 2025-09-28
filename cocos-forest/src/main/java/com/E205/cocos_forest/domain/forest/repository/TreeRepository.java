package com.E205.cocos_forest.domain.forest.repository;

import com.E205.cocos_forest.domain.forest.entity.GrowthStage;
import com.E205.cocos_forest.domain.forest.entity.Plants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Tree 엔티티에 대한 데이터 액세스 레이어
 */
@Repository
public interface TreeRepository extends JpaRepository<Plants, Long> {

    /**
     * 특정 숲의 모든 나무 조회
     */
    List<Plants> findByForestIdOrderByXAscYAsc(Long forestId);

    /**
     * 특정 숲의 살아있는 나무만 조회
     */
    List<Plants> findByForestIdAndIsDeadFalseOrderByXAscYAsc(Long forestId);

    /**
     * 특정 위치의 나무 조회
     */
    Optional<Plants> findByForestIdAndXAndY(Long forestId, Integer x, Integer y);

    /**
     * 특정 위치에 나무가 있는지 확인
     */
    boolean existsByForestIdAndXAndY(Long forestId, Integer x, Integer y);

    /**
     * 완전 성장한 나무들 조회 (포인트 지급 대상)
     */
    @Query("SELECT t FROM Plants t " +
            "WHERE t.growthStage = :growthStage " +
            "AND t.health >= :minHealth " +
            "AND t.isDead = false")
    List<Plants> findFullyGrownTrees(@Param("growthStage") GrowthStage growthStage,
                                     @Param("minHealth") Integer minHealth);

    /**
     * 사용자별 완전 성장한 나무들 조회
     */
    @Query("SELECT t FROM Plants t " +
            "JOIN t.forest f " +
            "WHERE f.userId = :userId " +
            "AND t.growthStage = 'LARGE' " +
            "AND t.health >= 80 " +
            "AND t.isDead = false")
    List<Plants> findFullyGrownTreesByUserId(@Param("userId") Long userId);

    /**
     * 죽음 하이라이트가 표시된 나무들 조회
     */
    List<Plants> findByForestIdAndDeadHighlightTrue(Long forestId);

    /**
     * 배치 작업: 모든 살아있는 나무의 체력 감소
     */
    @Modifying
    @Query("UPDATE Plants t SET t.health = GREATEST(t.health - :amount, 0), t.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE t.isDead = false")
    int decreaseAllTreeHealth(@Param("amount") Integer amount);

    /**
     * 배치 작업: 특정 사용자들의 나무 추가 체력 감소 (탄소배출 초과)
     */
    @Modifying
    @Query("UPDATE Plants t SET t.health = GREATEST(t.health - :amount, 0), t.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE t.forest.userId IN :userIds AND t.isDead = false")
    int decreaseTreeHealthForUsers(@Param("userIds") List<Long> userIds, @Param("amount") Integer amount);

    /**
     * 배치 작업: 체력이 0인 나무들 사망 처리
     */
    @Modifying
    @Query("UPDATE Plants t SET t.isDead = true, t.deadHighlight = true, t.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE t.health = 0 AND t.isDead = false")
    int markDeadTrees();

    /**
     * 배치 작업: 성장 조건을 만족하는 나무들의 성장일수 증가
     */
    @Modifying
    @Query("UPDATE Plants t SET t.growthDays = t.growthDays + 1, t.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE t.isDead = false " +
            "AND ((t.growthStage = 'SMALL' AND t.health >= 40) " +
            "OR (t.growthStage = 'MEDIUM' AND t.health >= 65) " +
            "OR (t.growthStage = 'LARGE' AND t.health >= 80))")
    int increaseGrowthDaysForEligibleTrees();

    /**
     * 배치 작업: 3일 달성한 나무들의 성장 단계 업그레이드
     */
    @Modifying
    @Query("UPDATE Plants t SET " +
            "t.growthStage = CASE " +
            "  WHEN t.growthStage = 'SMALL' THEN 'MEDIUM' " +
            "  WHEN t.growthStage = 'MEDIUM' THEN 'LARGE' " +
            "  ELSE t.growthStage END, " +
            "t.maxHealth = CASE " +
            "  WHEN t.growthStage = 'SMALL' THEN 80 " +
            "  WHEN t.growthStage = 'MEDIUM' THEN 100 " +
            "  ELSE t.maxHealth END, " +
            "t.growthDays = 0, " +
            "t.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE t.growthDays >= 3 AND t.growthStage IN ('SMALL', 'MEDIUM')")
    int upgradeTreeGrowthStage();

    /**
     * 배치 작업: 성장 조건 미달 나무들의 진행도 리셋
     */
    @Modifying
    @Query("UPDATE Plants t SET t.growthDays = 0, t.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE t.isDead = false " +
            "AND t.growthDays > 0 " +
            "AND NOT ((t.growthStage = 'SMALL' AND t.health >= 40) " +
            "OR (t.growthStage = 'MEDIUM' AND t.health >= 65) " +
            "OR (t.growthStage = 'LARGE' AND t.health >= 80))")
    int resetGrowthProgressForIneligibleTrees();

    /**
     * 배치 작업: 모든 나무의 물주기 카운트 리셋
     */
    @Modifying
    @Query("UPDATE Plants t SET t.waterCountToday = 0, t.updatedAt = CURRENT_TIMESTAMP")
    int resetAllWaterCounts();

    /**
     * 오늘 물준 횟수가 3회 미만인 나무인지 확인
     */
    @Query("SELECT CASE WHEN t.lastWateredDate != CURRENT_DATE OR t.waterCountToday < 3 THEN true ELSE false END " +
            "FROM Plants t WHERE t.id = :treeId")
    boolean canWaterToday(@Param("treeId") Long treeId);
}