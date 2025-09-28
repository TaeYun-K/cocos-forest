package com.E205.cocos_forest.domain.health.repository;

import com.E205.cocos_forest.domain.health.entity.DailySteps;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyStepsRepository extends JpaRepository<DailySteps, Long> {
    Optional<DailySteps> findByUserIdAndTargetDate(Long userId, LocalDate targetDate);
}

