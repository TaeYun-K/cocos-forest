package com.E205.cocos_forest.domain.finance.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserCardRepository extends JpaRepository<UserCard, Long> {
    Optional<UserCard> findByUserIdAndCardUniqueNo(Long userId, String cardUniqueNo);
    List<UserCard> findByUserId(Long userId);
    Optional<UserCard> findByCardUniqueNo(String cardUniqueNo);
    Optional<UserCard> findTopByUserIdOrderByCreatedAtDesc(Long userId);
}
