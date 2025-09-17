package com.E205.cocos_forest.domain.finance.merchant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    List<Merchant> findByIdIn(Set<Long> ids);
}

