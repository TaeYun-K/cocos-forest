package com.E205.cocos_forest.domain.finance.card.transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {
    List<CardTransaction> findByUserIdAndTxDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<CardTransaction> findByUserIdAndTxDate(Long userId, LocalDate txDate);
}
