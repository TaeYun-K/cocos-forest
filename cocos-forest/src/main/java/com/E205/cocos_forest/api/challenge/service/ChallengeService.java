package com.E205.cocos_forest.api.challenge.service;

import com.E205.cocos_forest.api.challenge.dto.ChallengeTodayOut;

public interface ChallengeService {
    ChallengeTodayOut getTodayChallenges(Long userId);
}

