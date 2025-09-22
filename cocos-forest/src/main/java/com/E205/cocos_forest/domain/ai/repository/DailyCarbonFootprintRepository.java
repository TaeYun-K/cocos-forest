package com.E205.cocos_forest.domain.ai.repository;

import com.E205.cocos_forest.domain.ai.entity.DailyCarbonFootprint;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyCarbonFootprintRepository extends JpaRepository<DailyCarbonFootprint, Long> {
    Optional<DailyCarbonFootprint> findByUserIdAndTargetDate(Long userId, LocalDate targetDate);
}