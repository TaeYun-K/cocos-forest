package com.E205.cocos_forest.domain.user.repository;

import com.E205.cocos_forest.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @Repository: 이 인터페이스가 데이터 접근 계층(Repository)임을 Spring에 알려줍니다.
 *
 * JpaRepository<User, Long>: JpaRepository를 상속받습니다. 첫 번째 제네릭 타입은 관리할 Entity 클래스(User), 두 번째는 해당 Entity의 PK 타입(Long)입니다.
 *
 * 상속만으로: save(), findById(), findAll(), delete() 등 기본적인 CRUD 메서드를 자동으로 사용할 수 있게 됩니다.
 *
 * 메서드 이름으로 쿼리 생성: JPA는 정해진 규칙에 따라 메서드 이름을 만들면, 그에 맞는 SQL 쿼리를 자동으로 생성해줍니다.
 *
 * existsByEmail(String email): SELECT COUNT(*) FROM users WHERE email = ? 와 유사한 쿼리를 실행하여 해당 이메일의 존재 여부(true/false)를 반환합니다.
 *
 * existsByNickname(String nickname): 닉네임 존재 여부를 확인합니다.
 *
 * findByEmail(String email): 이메일로 사용자를 조회합니다. 결과가 없을 수도 있으므로 Optional<User>로 감싸서 Null-safe하게 처리합니다.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);

    Optional<User> findByEmail(String email);

    /**
     * 삭제되지 않은 사용자만 조회
     */
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findAllActiveUsers();

    /**
     * 특정 일자에 탄소배출량이 임계값을 초과한 사용자들 조회 (배치 작업용)
     */
    @Query("SELECT u.id FROM User u " +
                    "JOIN DailyEmission de ON u.id = de.userId " +
                    "WHERE de.emissionDate = :date AND de.totalEmission > :threshold")
    List<Long> findUserIdsWithExcessiveEmission(@Param("date") java.time.LocalDate date,
                    @Param("threshold") java.math.BigDecimal threshold);
}
