package com.E205.cocos_forest.api.forest.service;

import com.E205.cocos_forest.api.forest.dto.out.AssetResponseDto;
import com.E205.cocos_forest.domain.forest.entity.Asset;
import com.E205.cocos_forest.domain.forest.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    public List<AssetResponseDto> listAssets(Long categoryId) {
        List<Asset> assets = (categoryId != null)
                ? assetRepository.findByCategoryIdAndActiveTrueOrderByNameAsc(categoryId)
                : assetRepository.findByActiveTrueOrderByCategoryIdAscNameAsc();
        return assets.stream()
                .map(AssetResponseDto::from)
                .collect(Collectors.toList());
    }
}

