package com.E205.cocos_forest.api.challenge.service.challenge;

import com.E205.cocos_forest.domain.challenge.entity.Challenge;
import com.E205.cocos_forest.domain.challenge.entity.UserChallenge;
import com.E205.cocos_forest.domain.challenge.repository.ChallengeRepository;
import com.E205.cocos_forest.domain.challenge.repository.UserChallengeRepository;
import com.E205.cocos_forest.api.forest.service.PointService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 자동으로 매일 12:00 KST에 챌린지 정산 작업을 수행
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChallengeDailyScheduler {

    private static final ZoneId ZONE_KST = ZoneId.of("Asia/Seoul");

    private final UserChallengeRepository userChallengeRepository;
    private final ChallengeRepository challengeRepository;
    private final PointService pointService;

    // 매일 00:05 KST에 전일 챌린지를 정산
    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void finalizeYesterday() {
        LocalDate yesterday = LocalDate.now(ZONE_KST).minusDays(1);
        log.info("[Challenge] Daily finalize start for {}", yesterday);

        List<UserChallenge> list = userChallengeRepository.findByChallengeDate(yesterday);
        if (list.isEmpty()) {
            log.info("[Challenge] No user_challenges to finalize");
            return;
        }

        // 내 챌린지 정보 미리 조회
        Map<Long, Challenge> challengeMap = challengeRepository
            .findAllById(list.stream().map(UserChallenge::getChallengeId).collect(Collectors.toSet()))
            .stream().collect(Collectors.toMap(Challenge::getId, Function.identity()));

        // 정산 처리
        for (UserChallenge uc : list) {
            Challenge ch = challengeMap.get(uc.getChallengeId());
            if (ch == null) continue;

            // PENDING은 전일 기준 FAIL 처리
            if (uc.getStatus() == UserChallenge.Status.PENDING) {
                uc.setStatus(UserChallenge.Status.FAIL);
                userChallengeRepository.save(uc);
                continue;
            }

            // 상태가 DONE이지만 미지급 상태면 자동 지급
            if (uc.getStatus() == UserChallenge.Status.DONE
                && (uc.getRewardPoints() == null || uc.getRewardPoints() == 0)) {
                try {
                    pointService.earnPoints(uc.getUserId(), ch.getRewardPoints(), "CHALLENGE_REWARD", uc.getId(), ch.getTitle());
                    uc.setRewardPoints(ch.getRewardPoints());
                    userChallengeRepository.save(uc);
                } catch (Exception e) {
                    log.warn("[Challenge] Scheduled reward claim failed: ucId={}, reason={}", uc.getId(), e.getMessage());
                }
            }
        }

        log.info("[Challenge] Daily finalize end for {}", yesterday);
    }
}

