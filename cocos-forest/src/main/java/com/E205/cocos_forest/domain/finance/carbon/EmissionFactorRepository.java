package com.E205.cocos_forest.domain.finance.carbon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByCategoryId(String categoryId);
    List<EmissionFactor> findByCategoryIdIn(Collection<String> categoryIds);
}
