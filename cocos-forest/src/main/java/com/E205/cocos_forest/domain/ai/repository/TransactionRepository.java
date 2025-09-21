package com.E205.cocos_forest.domain.ai.repository;

import com.E205.cocos_forest.domain.ai.entity.Transaction;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdAndTransactionAtBetween(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);
}