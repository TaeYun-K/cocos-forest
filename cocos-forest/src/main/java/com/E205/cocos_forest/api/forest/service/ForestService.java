package com.E205.cocos_forest.api.forest.service;

import com.E205.cocos_forest.domain.forest.dto.*;
import com.E205.cocos_forest.domain.forest.entity.Forest;
import com.E205.cocos_forest.domain.forest.entity.GrowthStage;
import com.E205.cocos_forest.domain.forest.entity.Tree;
import com.E205.cocos_forest.domain.forest.repository.ForestRepository;
import com.E205.cocos_forest.domain.forest.repository.TreeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 숲 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ForestService {

    private final ForestRepository forestRepository;
    private final TreeRepository treeRepository;
    private final PointService pointService;

    /**
     * 사용자의 숲 생성 (최초 1회)
     */
    @Transactional
    public ForestResponseDto createForest(Long userId) {
        // 이미 숲이 있는지 확인
        if (forestRepository.existsByUserId(userId)) {
            throw new IllegalStateException("이미 숲이 존재합니다.");
        }

        // 새 숲 생성
        Forest forest = Forest.builder()
                .userId(userId)
                .size(8)
                .pondX(3)
                .pondY(3)
                .build();

        Forest savedForest = forestRepository.save(forest);
        log.info("사용자 {}의 숲이 생성되었습니다. Forest ID: {}", userId, savedForest.getId());

        return ForestResponseDto.from(savedForest);
    }

    /**
     * 사용자의 숲 조회
     */
    public ForestResponseDto getForest(Long userId) {
        Forest forest = forestRepository.findByUserIdWithTrees(userId)
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));

        return ForestResponseDto.from(forest);
    }

    /**
     * 나무 심기 (100포인트 차감)
     */
    @Transactional
    public TreeResponseDto plantTree(Long userId, PlantTreeRequestDto request) {
        // 숲 조회
        Forest forest = forestRepository.findByUserIdWithTrees(userId)
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));

        // 심을 수 있는 위치인지 확인
        if (!forest.canPlantTree(request.getX(), request.getY())) {
            throw new IllegalArgumentException("해당 위치에는 나무를 심을 수 없습니다.");
        }

        // 포인트 차감 (100포인트)
        pointService.spendPoints(userId, 100, "PLANT", forest.getId(), "나무 심기");

        // 나무 생성
        Tree tree = Tree.builder()
                .forestId(forest.getId())
                .x(request.getX())
                .y(request.getY())
                .growthStage(GrowthStage.SMALL)
                .build();

        Tree savedTree = treeRepository.save(tree);
        log.info("사용자 {}가 ({}, {}) 위치에 나무를 심었습니다. Tree ID: {}", 
                userId, request.getX(), request.getY(), savedTree.getId());

        return TreeResponseDto.from(savedTree);
    }

    /**
     * 물주기 (50포인트 차감, 하루 3회 제한)
     */
    @Transactional
    public WaterTreeResponseDto waterTree(Long userId, Long treeId) {
        // 나무 조회 및 권한 확인
        Tree tree = treeRepository.findById(treeId)
                .orElseThrow(() -> new IllegalArgumentException("나무를 찾을 수 없습니다."));

        // 사용자의 나무인지 확인
        Forest forest = forestRepository.findById(tree.getForestId())
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));
        
        if (!forest.getUserId().equals(userId)) {
            throw new IllegalArgumentException("다른 사용자의 나무입니다.");
        }

        // 죽은 나무인지 확인
        if (tree.getIsDead()) {
            return WaterTreeResponseDto.failure("죽은 나무에는 물을 줄 수 없습니다.");
        }

        // 물주기 시도
        boolean success = tree.water();
        if (!success) {
            return WaterTreeResponseDto.failure("오늘은 더 이상 물을 줄 수 없습니다. (하루 3회 제한)");
        }

        // 포인트 차감 (50포인트)
        pointService.spendPoints(userId, 50, "WATER", treeId, "물주기");

        treeRepository.save(tree);
        log.info("사용자 {}가 나무 {}에 물을 주었습니다. 현재 체력: {}/{}", 
                userId, treeId, tree.getHealth(), tree.getMaxHealth());

        return WaterTreeResponseDto.success(tree);
    }

    /**
     * 나무 위치 이동 (무료)
     */
    @Transactional
    public TreeResponseDto moveTree(Long userId, MoveTreeRequestDto request) {
        // 나무 조회 및 권한 확인
        Tree tree = treeRepository.findById(request.getTreeId())
                .orElseThrow(() -> new IllegalArgumentException("나무를 찾을 수 없습니다."));

        Forest forest = forestRepository.findById(tree.getForestId())
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));
        
        if (!forest.getUserId().equals(userId)) {
            throw new IllegalArgumentException("다른 사용자의 나무입니다.");
        }

        // 이동할 위치가 유효한지 확인
        if (!forest.canPlantTree(request.getNewX(), request.getNewY())) {
            throw new IllegalArgumentException("해당 위치로는 이동할 수 없습니다.");
        }

        // 위치 이동
        tree.moveTo(request.getNewX(), request.getNewY());
        Tree savedTree = treeRepository.save(tree);
        
        log.info("사용자 {}가 나무 {}를 ({}, {})로 이동했습니다.", 
                userId, request.getTreeId(), request.getNewX(), request.getNewY());

        return TreeResponseDto.from(savedTree);
    }

    /**
     * 죽은 나무 제거 (하이라이트 제거)
     */
    @Transactional
    public void removeDeadTree(Long userId, Long treeId) {
        // 나무 조회 및 권한 확인
        Tree tree = treeRepository.findById(treeId)
                .orElseThrow(() -> new IllegalArgumentException("나무를 찾을 수 없습니다."));

        Forest forest = forestRepository.findById(tree.getForestId())
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));
        
        if (!forest.getUserId().equals(userId)) {
            throw new IllegalArgumentException("다른 사용자의 나무입니다.");
        }

        // 죽은 나무 하이라이트 제거
        tree.removeDead();
        treeRepository.save(tree);
        
        log.info("사용자 {}가 죽은 나무 {} 하이라이트를 제거했습니다.", userId, treeId);
    }

    /**
     * 숲 확장 (1000포인트 차감)
     */
    @Transactional
    public ForestResponseDto expandForest(Long userId) {
        // 숲 조회
        Forest forest = forestRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));

        // 포인트 차감 (1000포인트)
        pointService.spendPoints(userId, 1000, "EXPAND", forest.getId(), "숲 확장");

        // 숲 확장
        forest.expandSize();
        Forest savedForest = forestRepository.save(forest);
        
        log.info("사용자 {}가 숲을 {}x{}로 확장했습니다.", userId, savedForest.getSize(), savedForest.getSize());

        return ForestResponseDto.from(savedForest);
    }

    /**
     * 연못 위치 이동 (무료)
     */
    @Transactional
    public ForestResponseDto movePond(Long userId, MovePondRequestDto request) {
        // 숲 조회
        Forest forest = forestRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("숲을 찾을 수 없습니다."));

        // 연못 위치 이동
        forest.movePond(request.getNewX(), request.getNewY());
        Forest savedForest = forestRepository.save(forest);
        
        log.info("사용자 {}가 연못을 ({}, {})로 이동했습니다.", 
                userId, request.getNewX(), request.getNewY());

        return ForestResponseDto.from(savedForest);
    }
}
