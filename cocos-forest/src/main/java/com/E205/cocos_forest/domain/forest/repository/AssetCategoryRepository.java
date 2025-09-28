package com.E205.cocos_forest.domain.forest.repository;

import com.E205.cocos_forest.domain.forest.entity.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    List<AssetCategory> findByActiveTrueOrderByNameAsc();
    Optional<AssetCategory> findByCode(String code);
}

