package com.E205.cocos_forest.domain.finance.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardProductRepository extends JpaRepository<CardProduct, Long> {
    List<CardProduct> findByIssuerCodeOrderByNameAsc(String issuerCode);
}
