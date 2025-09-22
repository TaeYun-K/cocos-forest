package com.E205.cocos_forest.api.challenge.service.challenge;

import com.E205.cocos_forest.api.challenge.dto.out.ChallengeTodayOut;

public interface ChallengeService {
    ChallengeTodayOut getTodayChallenges(Long userId);

    void claimReward(Long userId, Long userChallengeId);

    void evaluateStepsChallenge(Long userId);
}
