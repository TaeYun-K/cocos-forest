package com.E205.cocos_forest.domain.challenge.repository;

import com.E205.cocos_forest.domain.challenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.*;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByIsActiveTrue();

    Optional<Challenge> findFirstByIsActiveTrueAndMetricType(Challenge.MetricType metricType);

    List<Challenge> findByIsActiveTrueAndMetricType(Challenge.MetricType metricType);
}

