package com.E205.cocos_forest.domain.forest.repository;

import com.E205.cocos_forest.domain.forest.entity.Decoration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecorationRepository extends JpaRepository<Decoration, Long> {
    List<Decoration> findByForestIdOrderByXAscYAsc(Long forestId);
    boolean existsByForestIdAndXAndY(Long forestId, Integer x, Integer y);
}

