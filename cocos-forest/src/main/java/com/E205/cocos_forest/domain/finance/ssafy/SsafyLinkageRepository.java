// com/E205/cocos_forest/domain/ssafy/SsafyLinkageRepository.java
package com.E205.cocos_forest.domain.finance.ssafy;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SsafyLinkageRepository extends JpaRepository<SsafyLinkage, Long> {
    Optional<SsafyLinkage> findByUserId(Long userId);
}
