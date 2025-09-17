package com.E205.cocos_forest.domain.finance.bank;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankRepository extends JpaRepository<Bank, String> {
    List<Bank> findAllByOrderByBankNameAsc();
}
