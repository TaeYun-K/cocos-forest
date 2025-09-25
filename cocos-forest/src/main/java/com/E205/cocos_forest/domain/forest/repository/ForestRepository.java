package com.E205.cocos_forest.domain.forest.repository;

import com.E205.cocos_forest.domain.forest.entity.Forest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Forest 엔티티에 대한 데이터 액세스 레이어
 */
@Repository
public interface ForestRepository extends JpaRepository<Forest, Long> {

    /**
     * 사용자 ID로 숲 조회
     */
    Optional<Forest> findByUserId(Long userId);

    /**
     * 사용자가 숲을 가지고 있는지 확인
     */
    boolean existsByUserId(Long userId);

    /**
     * 사용자의 숲과 식물(나무/꽃) 정보를 함께 조회 (Fetch Join)
     */
    @Query("SELECT DISTINCT f FROM Forest f " +
           "LEFT JOIN FETCH f.plants p " +
           "LEFT JOIN FETCH p.asset " +
           "WHERE f.userId = :userId")
    Optional<Forest> findByUserIdWithTrees(@Param("userId") Long userId);

    /**
     * 사용자의 숲 정보와 살아있는 나무 개수 조회
     */
    @Query("SELECT f, " +
           "(SELECT COUNT(t) FROM Plants t WHERE t.forestId = f.id AND t.isDead = false) as aliveTreeCount, " +
           "(SELECT COUNT(t) FROM Plants t WHERE t.forestId = f.id AND t.deadHighlight = true) as deadHighlightCount " +
           "FROM Forest f WHERE f.userId = :userId")
    Optional<Object[]> findByUserIdWithTreeCounts(@Param("userId") Long userId);
}
