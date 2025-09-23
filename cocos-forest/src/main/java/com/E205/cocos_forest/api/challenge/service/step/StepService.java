package com.E205.cocos_forest.api.challenge.service.step;

import com.E205.cocos_forest.api.challenge.dto.out.StepsUpdateOut;

public interface StepService {
    StepsUpdateOut updateTodaySteps(Long userId, int steps);
}

