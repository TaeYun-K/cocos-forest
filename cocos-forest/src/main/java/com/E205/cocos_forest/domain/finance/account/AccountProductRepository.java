package com.E205.cocos_forest.domain.finance.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountProductRepository extends JpaRepository<AccountProduct, Long> {
    List<AccountProduct> findByBankBankCodeOrderByAccountNameAsc(String bankCode);
}
