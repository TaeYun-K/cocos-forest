package com.E205.cocos_forest.api.forest.service;

import com.E205.cocos_forest.domain.forest.entity.GrowthStage;
import com.E205.cocos_forest.domain.forest.entity.Plants;
import com.E205.cocos_forest.domain.forest.repository.TreeRepository;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 매일 오전 6시에 실행되는 배치 작업 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DailyBatchService {

    private final TreeRepository treeRepository;
    private final UserRepository userRepository;
    private final PointService pointService;

    /**
     * 매일 오전 6시 배치 작업 실행
     * - 체력 감소 처리
     * - 성장 체크
     * - 포인트 획득
     * - 물주기 3회 제한 리셋
     */
    @Scheduled(cron = "0 0 6 * * *") // 매일 오전 6시
    @Transactional
    public void runDailyBatch() {
        log.info("=== 일일 배치 작업 시작 ===");
        
        try {
            // 1. 일일 자연 체력 감소
            processNaturalHealthDecrease();
            
            // 2. 탄소배출 초과 사용자들의 추가 체력 감소
            processExcessiveEmissionPenalty();
            
            // 3. 나무 사망 처리
            processTreeDeaths();
            
            // 4. 성장 처리
            processTreeGrowth();
            
            // 5. 물주기 카운트 리셋
            resetWaterCounts();
            
            // 6. 완전 성장 나무 포인트 지급
            giveTreeRewards();
            
            log.info("=== 일일 배치 작업 완료 ===");
            
        } catch (Exception e) {
            log.error("일일 배치 작업 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * 1. 모든 살아있는 나무의 체력을 5씩 감소
     */
    private void processNaturalHealthDecrease() {
        int affectedTrees = treeRepository.decreaseAllTreeHealth(5);
        log.info("자연 체력 감소 완료: {}그루의 나무 체력 -5", affectedTrees);
    }

    /**
     * 2. 어제 탄소배출량이 40kg을 초과한 사용자들의 나무 추가 체력 감소
     */
    private void processExcessiveEmissionPenalty() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        BigDecimal threshold = new BigDecimal("40.0");
        
        List<Long> excessiveEmissionUserIds = userRepository
                .findUserIdsWithExcessiveEmission(yesterday, threshold);
        
        if (!excessiveEmissionUserIds.isEmpty()) {
            int affectedTrees = treeRepository
                    .decreaseTreeHealthForUsers(excessiveEmissionUserIds, 10);
            log.info("탄소배출 초과 페널티 적용 완료: {} 사용자의 {}그루 나무 체력 -10", 
                    excessiveEmissionUserIds.size(), affectedTrees);
        }
    }

    /**
     * 3. 체력이 0인 나무들을 사망 처리
     */
    private void processTreeDeaths() {
        int deadTrees = treeRepository.markDeadTrees();
        log.info("나무 사망 처리 완료: {}그루의 나무가 사망", deadTrees);
    }

    /**
     * 4. 나무 성장 처리
     */
    private void processTreeGrowth() {
        // 4-1. 성장 조건을 만족하는 나무들의 성장일수 증가
        int growingTrees = treeRepository.increaseGrowthDaysForEligibleTrees();
        log.info("성장 진행: {}그루의 나무 성장일수 +1", growingTrees);
        
        // 4-2. 3일 달성한 나무들의 성장 단계 업그레이드
        int upgradedTrees = treeRepository.upgradeTreeGrowthStage();
        log.info("성장 단계 업그레이드: {}그루의 나무가 다음 단계로 성장", upgradedTrees);
        
        // 4-3. 성장 조건 미달 나무들의 진행도 리셋
        int resetTrees = treeRepository.resetGrowthProgressForIneligibleTrees();
        log.info("성장 진행도 리셋: {}그루의 나무 성장 진행도 초기화", resetTrees);
    }

    /**
     * 5. 모든 나무의 물주기 카운트 리셋
     */
    private void resetWaterCounts() {
        int affectedTrees = treeRepository.resetAllWaterCounts();
        log.info("물주기 카운트 리셋 완료: {}그루의 나무", affectedTrees);
    }

    /**
     * 6. 완전 성장한 나무들에 대한 일일 포인트 지급
     */
    private void giveTreeRewards() {
        // 완전 성장한 나무들 조회 (LARGE 단계, 체력 80 이상)
        List<Plants> fullyGrownPlants = treeRepository
                .findFullyGrownTrees(GrowthStage.LARGE, 80);
        
        if (fullyGrownPlants.isEmpty()) {
            log.info("완전 성장한 나무가 없어 보상을 지급하지 않습니다.");
            return;
        }
        
        // 사용자별로 그룹화하여 포인트 지급
        Map<Long, List<Plants>> treesByUserId = fullyGrownPlants.stream()
                .collect(Collectors.groupingBy(tree -> tree.getForest().getUserId()));
        
        int totalRewardedUsers = 0;
        int totalRewardedTrees = 0;
        
        for (Map.Entry<Long, List<Plants>> entry : treesByUserId.entrySet()) {
            Long userId = entry.getKey();
            int treeCount = entry.getValue().size();
            
            try {
                pointService.giveTreeRewards(userId, treeCount);
                totalRewardedUsers++;
                totalRewardedTrees += treeCount;
                
            } catch (Exception e) {
                log.error("사용자 {}의 나무 보상 지급 실패", userId, e);
            }
        }
        
        log.info("나무 일일 보상 지급 완료: {} 사용자, {}그루 나무 (총 {}포인트)", 
                totalRewardedUsers, totalRewardedTrees, totalRewardedTrees * 50);
    }

    /**
     * 수동 배치 실행 (테스트용)
     */
    public void runManualBatch() {
        log.info("수동 배치 작업 실행");
        runDailyBatch();
    }
}
