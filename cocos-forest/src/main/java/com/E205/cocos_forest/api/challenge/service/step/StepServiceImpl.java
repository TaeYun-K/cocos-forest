package com.E205.cocos_forest.api.challenge.service.step;

import com.E205.cocos_forest.api.challenge.dto.out.StepsUpdateOut;
import com.E205.cocos_forest.domain.health.entity.DailySteps;
import com.E205.cocos_forest.domain.health.repository.DailyStepsRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StepServiceImpl implements StepService {

    private static final ZoneId ZONE_KST = ZoneId.of("Asia/Seoul");

    private final DailyStepsRepository dailyStepsRepository;

    @Override
    @Transactional
    public StepsUpdateOut updateTodaySteps(Long userId, int steps) {
        if (steps < 0) steps = 0;
        LocalDate today = LocalDate.now(ZONE_KST);

        DailySteps entity = dailyStepsRepository
            .findByUserIdAndTargetDate(userId, today)
            .orElseGet(() -> {
                DailySteps ds = new DailySteps();
                ds.setUserId(userId);
                ds.setTargetDate(today);
                return ds;
            });

        entity.setSteps(steps);
        dailyStepsRepository.save(entity);

        return StepsUpdateOut.builder()
            .date(today.toString())
            .steps(entity.getSteps())
            .build();
    }
}

