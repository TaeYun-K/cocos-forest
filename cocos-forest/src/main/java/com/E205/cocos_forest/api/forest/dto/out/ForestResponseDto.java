package com.E205.cocos_forest.api.forest.dto.out;

import com.E205.cocos_forest.domain.forest.entity.Forest;
import com.E205.cocos_forest.api.forest.dto.out.DecorationResponseDto;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.E205.cocos_forest.domain.forest.entity.Plants;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 숲 조회 응답 DTO
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ForestResponseDto {
    
    private Long forestId;
    private Long userId;
    private Integer size;
    private Integer pondX;
    private Integer pondY;
    private Integer aliveTreeCount;
    private Integer deadHighlightCount;
    private List<TreeResponseDto> trees;
    private List<DecorationResponseDto> decorations;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ForestResponseDto from(Forest forest) {
        return ForestResponseDto.builder()
                .forestId(forest.getId())
                .userId(forest.getUserId())
                .size(forest.getSize())
                .pondX(forest.getPondX())
                .pondY(forest.getPondY())
                .aliveTreeCount((int) forest.getPlants().stream().filter(tree -> !tree.getIsDead()).count())
                .deadHighlightCount((int) forest.getPlants().stream().filter(Plants::getDeadHighlight).count())
                .trees(forest.getPlants().stream()
                        .map(TreeResponseDto::from)
                        .collect(Collectors.toList()))
                .decorations(forest.getDecorations().stream()
                        .map(DecorationResponseDto::from)
                        .collect(Collectors.toList()))
                .createdAt(forest.getCreatedAt())
                .updatedAt(forest.getUpdatedAt())
                .build();
    }
}
