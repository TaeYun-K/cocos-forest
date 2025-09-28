package com.E205.cocos_forest.domain.forest.repository;

import com.E205.cocos_forest.domain.forest.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByActiveTrueOrderByCategoryIdAscNameAsc();
    List<Asset> findByCategoryIdAndActiveTrueOrderByNameAsc(Long categoryId);
}

