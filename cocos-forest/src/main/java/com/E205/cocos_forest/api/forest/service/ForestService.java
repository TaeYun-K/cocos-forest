package com.E205.cocos_forest.api.forest.service;

import com.E205.cocos_forest.api.forest.dto.in.MovePondRequestDto;
import com.E205.cocos_forest.api.forest.dto.in.MoveTreeRequestDto;
import com.E205.cocos_forest.api.forest.dto.in.PlaceDecorationRequestDto;
import com.E205.cocos_forest.api.forest.dto.in.PlantTreeRequestDto;
import com.E205.cocos_forest.api.forest.dto.out.DecorationResponseDto;
import com.E205.cocos_forest.api.forest.dto.out.ForestResponseDto;
import com.E205.cocos_forest.api.forest.dto.out.TreeResponseDto;
import com.E205.cocos_forest.api.forest.dto.out.WaterTreeResponseDto;
import com.E205.cocos_forest.domain.forest.entity.Forest;
import com.E205.cocos_forest.domain.forest.entity.GrowthStage;
import com.E205.cocos_forest.domain.forest.entity.Plants;
import com.E205.cocos_forest.domain.forest.entity.Asset;
import com.E205.cocos_forest.domain.forest.entity.Decoration;
import com.E205.cocos_forest.domain.forest.repository.ForestRepository;
import com.E205.cocos_forest.domain.forest.repository.TreeRepository;
import com.E205.cocos_forest.domain.forest.repository.AssetRepository;
import com.E205.cocos_forest.domain.forest.repository.DecorationRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 숲 관련 비즈니스 로직을 처리하는 서비스
 */
/**
 * 숲 게임(포레스트) 도메인 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ForestService {

    private final ForestRepository forestRepository;
    private final TreeRepository treeRepository;
    private final PointService pointService;
    private final AssetRepository assetRepository;
    private final DecorationRepository decorationRepository;
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 사용자의 숲 생성 (최초 1회)
    */
    @Transactional
    public ForestResponseDto createForest(Long userId) {
        // 이미 생성되어 있는지 확인 (중복 방지)
        if (forestRepository.existsByUserId(userId)) {
            throw new BaseException(BaseResponseStatus.FOREST_ALREADY_EXISTS);
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
            .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        return ForestResponseDto.from(forest);
    }

    /**
     * 나무/꽃(식물) 심기 (asset 가격만큼 포인트 차감)
     */
    @Transactional
    public TreeResponseDto plant(Long userId, PlantTreeRequestDto request) {
        // 숲 조회
        Forest forest = forestRepository.findByUserIdWithTrees(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        // 심을 수 있는 위치인지 확인 (구체적인 에러 메시지)
        validateTreePosition(forest, request.getX(), request.getY());

        // 자산 검증 (활성 + 카테고리: 1=나무, 2=꽃)
        if (request.getAssetId() == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "assetId가 필요합니다.");
        }
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "유효하지 않은 자산입니다."));
        if (asset.getActive() == null || !asset.getActive()) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "비활성 자산은 심을 수 없습니다.");
        }
        Long categoryId = asset.getCategoryId();
        if (categoryId == null || (categoryId != 1L && categoryId != 2L)) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "나무/꽃 자산만 심을 수 있습니다.");
        }

        // 포인트 차감 (자산 가격)
        try {
            int price = asset.getPricePoints() != null ? asset.getPricePoints() : 0;
            pointService.spendPoints(userId, price, "PLANT", forest.getId(), String.format("식물 심기 - %s", asset.getName()));
        } catch (IllegalArgumentException e) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_POINTS, e.getMessage());
        }

        // 식물 생성
        Plants plants = Plants.builder()
            .forestId(forest.getId())
            .x(request.getX())
            .y(request.getY())
            .growthStage(GrowthStage.SMALL)
            .assetId(asset.getId())
            .build();

        Plants savedPlants = treeRepository.save(plants);
        log.info("사용자 {}가 ({}, {}) 위치에 나무를 심었습니다. Tree ID: {}",
            userId, request.getX(), request.getY(), savedPlants.getId());

        return TreeResponseDto.from(savedPlants);
    }

    /**
     * 장식 배치 (자산 가격만큼 포인트 차감)
     */
    @Transactional
    public DecorationResponseDto placeDecoration(Long userId, PlaceDecorationRequestDto request) {
        // 숲 조회
        Forest forest = forestRepository.findByUserId(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        // 좌표 유효성: 경계/연못
        Integer x = request.getX();
        Integer y = request.getY();
        if (x == null || y == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "좌표가 필요합니다.");
        }
        if (x < 0 || x >= forest.getSize() || y < 0 || y >= forest.getSize()) {
            throw new BaseException(BaseResponseStatus.OUT_OF_FOREST_BOUNDS,
                String.format("숲 범위를 벗어난 위치입니다. (유효 범위: 0~%d)", forest.getSize()-1));
        }
        if (forest.isPondArea(x, y)) {
            throw new BaseException(BaseResponseStatus.POND_AREA_RESTRICTION);
        }

        // 점유 확인: 식물/장식 모두 비어 있어야 함
        boolean plantOccupied = treeRepository.existsByForestIdAndXAndY(forest.getId(), x, y);
        boolean decoOccupied = decorationRepository.existsByForestIdAndXAndY(forest.getId(), x, y);
        if (plantOccupied || decoOccupied) {
            throw new BaseException(BaseResponseStatus.POSITION_OCCUPIED);
        }

        // 자산 검증: 활성 + 카테고리는 식물이 아니어야 함 (1,2 제외)
        if (request.getAssetId() == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "assetId가 필요합니다.");
        }
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "유효하지 않은 자산입니다."));
        if (asset.getActive() == null || !asset.getActive()) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "비활성 자산은 배치할 수 없습니다.");
        }
        Long categoryId = asset.getCategoryId();
        if (categoryId != null && (categoryId == 1L || categoryId == 2L)) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "식물 자산은 장식 배치 API가 아닌 식물 심기 API를 사용하세요.");
        }

        // 포인트 차감
        try {
            int price = asset.getPricePoints() != null ? asset.getPricePoints() : 0;
            pointService.spendPoints(userId, price, "DECORATE", forest.getId(), String.format("장식 배치 - %s", asset.getName()));
        } catch (IllegalArgumentException e) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_POINTS, e.getMessage());
        }

        // 장식 저장
        Decoration decoration = Decoration.builder()
                .forestId(forest.getId())
                .x(x)
                .y(y)
                .assetId(asset.getId())
                .build();

        Decoration saved = decorationRepository.save(decoration);
        log.info("사용자 {}가 ({}, {}) 위치에 장식(assetId={})을 배치했습니다. Decoration ID: {}",
                userId, x, y, asset.getId(), saved.getId());

        return DecorationResponseDto.from(saved);
    }

    /**
     * 물주기 (50포인트 차감, 하루 3회 제한)
     */
    @Transactional
    public WaterTreeResponseDto waterPlant(Long userId, Long plantId) {
        // 나무 조회 및 권한 확인
        Plants plants = treeRepository.findById(plantId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.TREE_NOT_FOUND));

        validateTreeOwnership(plants, userId);

        // 죽은 나무인지 확인
        if (plants.getIsDead()) {
            throw new BaseException(BaseResponseStatus.DEAD_TREE_ACTION, "죽은 나무에는 물을 줄 수 없습니다.");
        }

        // 물주기 시도
        boolean success = plants.water();
        if (!success) {
            throw new BaseException(BaseResponseStatus.WATER_LIMIT_EXCEEDED);
        }

        // 포인트 차감 (50포인트)
        try {
            pointService.spendPoints(userId, 50, "WATER", plantId, "물주기");
        } catch (IllegalArgumentException e) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_POINTS, e.getMessage());
        }

        treeRepository.save(plants);
        log.info("사용자 {}가 식물 {}에 물을 주었습니다. 현재 체력: {}/{}",
            userId, plantId, plants.getHealth(), plants.getMaxHealth());

        return WaterTreeResponseDto.success(plants);
    }

    /**
     * decorationId에 해당하는 장식을 삭제합니다
     */
    @Transactional
    public void removeDecoration(Long userId, Long decorationId) {
        // 입력값 검증
        Decoration decoration = decorationRepository.findById(decorationId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "에셋 id가 유효하지 않습니다"));

        // user 의 forest id 검색
        Forest forest = forestRepository.findById(decoration.getForestId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));
        if (!forest.getUserId().equals(userId)) {
            throw new BaseException(BaseResponseStatus.UNAUTHORIZED_FOREST_ACCESS);
        }

        // 해당 숲의 asset id 검색
        Asset asset = assetRepository.findById(decoration.getAssetId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "해당 숲에 존재하지 않은 장식입니다."));
        int price = asset.getPricePoints() != null ? asset.getPricePoints() : 0;

        // point 전액 환불
        pointService.earnPoints(userId, price, "DECORATION_REFUND", decorationId,
                String.format("환불된 장식명 : ", asset.getName()));

        // decoration 삭ㅈ
        decorationRepository.delete(decoration);

        log.info("user id : {}, decorationId :  {}, price : {}, 삭제 완료 ", userId, decorationId, price);
    }

    /**
     * 나무 위치 이동 (무료)
     */
    @Transactional
    public TreeResponseDto moveTree(Long userId, MoveTreeRequestDto request) {
        // 나무 조회 및 권한 확인
        Plants plants = treeRepository.findById(request.getTreeId())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.TREE_NOT_FOUND));

        Forest forest = forestRepository.findById(plants.getForestId())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        validateTreeOwnership(plants, userId);

        // 이동할 위치가 유효한지 확인
        validateTreePosition(forest, request.getNewX(), request.getNewY());

        // 위치 이동
        plants.moveTo(request.getNewX(), request.getNewY());
        Plants savedPlants = treeRepository.save(plants);

        log.info("사용자 {}가 나무 {}를 ({}, {})로 이동했습니다.",
            userId, request.getTreeId(), request.getNewX(), request.getNewY());

        return TreeResponseDto.from(savedPlants);
    }

    /**
     * 죽은 나무 제거 (완전 삭제)
     */
    @Transactional
    public void removeDeadTree(Long userId, Long treeId) {
        // 나무 조회 및 권한 확인
        Plants plants = treeRepository.findById(treeId)
                        .orElseThrow(() -> new BaseException(BaseResponseStatus.TREE_NOT_FOUND));

        validateTreeOwnership(plants, userId);

        // 죽은 나무인지 확인 (getter 메서드 사용)
        if (!plants.getIsDead() && plants.getHealth() > 0) {
            throw new BaseException(BaseResponseStatus.TREE_NOT_DEAD);
        }

        // 나무 완전 삭제
        treeRepository.delete(plants);

        log.info("사용자 {}가 죽은 나무 {}를 완전 삭제했습니다.", userId, treeId);
    }

    /**
     * 숲 확장 (1000포인트 차감)
     */
    @Transactional
    public ForestResponseDto expandForest(Long userId) {
        // 숲 조회
        Forest forest = forestRepository.findByUserId(userId)
                        .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        // 포인트 차감 (1000포인트)
        try {
            pointService.spendPoints(userId, 1000, "EXPAND", forest.getId(), "숲 확장");
        } catch (IllegalArgumentException e) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_POINTS, e.getMessage());
        }

        // 기존 나무들의 위치를 조정 (확장으로 인해 중앙으로 이동)
        // 숲이 2칸씩 확장되므로 각 방향으로 1칸씩 이동
        int offsetX = 1;
        int offsetY = 1;

        // 식물/장식 위치 조정 (유니크 제약 회피)
        shiftTreesPosition(forest.getId(), offsetX, offsetY);
        shiftDecorationsPosition(forest.getId(), offsetX, offsetY);

        // 숲 확장
        forest.expandSize();
        Forest savedForest = forestRepository.save(forest);

        log.info("사용자 {}가 숲을 {}x{}로 확장했습니다.", userId, savedForest.getSize(), savedForest.getSize());

        return ForestResponseDto.from(savedForest);
    }

    /**
     * 나무 위치 일괄 조정 (유니크 제약 회피를 위한 2단계 처리)
     */
    private void shiftTreesPosition(Long forestId, int offsetX, int offsetY) {
        // 1단계: 임시로 음수 변환하여 유니크 제약 회피
        String tempQuery = "UPDATE user_plants SET x = -(x + ?1), y = -(y + ?2) WHERE forest_id = ?3";

        entityManager.createNativeQuery(tempQuery)
                        .setParameter(1, offsetX)
                        .setParameter(2, offsetY)
                        .setParameter(3, forestId)
                        .executeUpdate();

        // 2단계: 최종 위치로 조정 (음수를 양수로)
        String finalQuery = "UPDATE user_plants SET x = -x, y = -y WHERE forest_id = ?1";

        entityManager.createNativeQuery(finalQuery)
                        .setParameter(1, forestId)
                        .executeUpdate();

        log.debug("숲 {}의 나무 위치를 ({}, {})만큼 이동했습니다.", forestId, offsetX, offsetY);
    }

    /**
     * 연못 위치 이동 (무료)
     */
    @Transactional
    public ForestResponseDto movePond(Long userId, MovePondRequestDto request) {
        // 숲 조회
        Forest forest = forestRepository.findByUserId(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        // 연못 위치 이동 (Forest 엔티티에서 검증 후 예외 발생 시 catch)
        try {
            forest.movePond(request.getNewX(), request.getNewY());
        } catch (IllegalArgumentException e) {
            throw new BaseException(BaseResponseStatus.INVALID_POND_POSITION, e.getMessage());
        }

        Forest savedForest = forestRepository.save(forest);

        log.info("사용자 {}가 연못을 ({}, {})로 이동했습니다.",
            userId, request.getNewX(), request.getNewY());

        return ForestResponseDto.from(savedForest);
    }

    // ===== 검증 메서드들 =====

    /**
     * 나무 위치 검증
     */
    private void validateTreePosition(Forest forest, Integer x, Integer y) {
        // 숲 범위 체크
        if (x < 0 || x >= forest.getSize() || y < 0 || y >= forest.getSize()) {
            throw new BaseException(BaseResponseStatus.OUT_OF_FOREST_BOUNDS,
                String.format("숲 범위를 벗어난 위치입니다. (유효 범위: 0~%d)", forest.getSize()-1));
        }

        // 연못 영역 체크
        if (forest.isPondArea(x, y)) {
            throw new BaseException(BaseResponseStatus.POND_AREA_RESTRICTION);
        }

        // 이미 나무가 있는지 체크
        if (forest.getPlants().stream().anyMatch(tree ->
            tree.getX().equals(x) && tree.getY().equals(y))) {
            throw new BaseException(BaseResponseStatus.POSITION_OCCUPIED);
        }
    }

    /**
     * 나무 소유권 검증
     */
    private void validateTreeOwnership(Plants plants, Long userId) {
        Forest forest = forestRepository.findById(plants.getForestId())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.FOREST_NOT_FOUND));

        if (!forest.getUserId().equals(userId)) {
            throw new BaseException(BaseResponseStatus.UNAUTHORIZED_TREE_ACCESS);
        }
    }

    /**
     * 장식 위치 일괄 조정 (유니크 제약 회피를 위한 2단계 처리)
     */
    private void shiftDecorationsPosition(Long forestId, int offsetX, int offsetY) {
        String tempQuery = "UPDATE user_decorations SET x = -(x + ?1), y = -(y + ?2) WHERE forest_id = ?3";

        entityManager.createNativeQuery(tempQuery)
                .setParameter(1, offsetX)
                .setParameter(2, offsetY)
                .setParameter(3, forestId)
                .executeUpdate();

        String finalQuery = "UPDATE user_decorations SET x = -x, y = -y WHERE forest_id = ?1";

        entityManager.createNativeQuery(finalQuery)
                .setParameter(1, forestId)
                .executeUpdate();

        log.debug("숲 {}의 장식 위치를 ({}, {})만큼 이동했습니다.", forestId, offsetX, offsetY);
    }
}
