package com.E205.cocos_forest.domain.finance.account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    List<UserAccount> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserAccount> findByAccountNo(String accountNo);
    boolean existsByAccountNo(String accountNo);
}
