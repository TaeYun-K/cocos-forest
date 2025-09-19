package com.E205.cocos_forest.domain.challenge.repository;

import com.E205.cocos_forest.domain.challenge.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {
    Optional<UserChallenge> findByUserIdAndChallengeIdAndChallengeDate(Long userId, Long challengeId, LocalDate challengeDate);
    List<UserChallenge> findByChallengeDate(LocalDate date);
}

