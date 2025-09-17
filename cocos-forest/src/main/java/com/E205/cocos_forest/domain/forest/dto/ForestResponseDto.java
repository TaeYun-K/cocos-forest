package com.E205.cocos_forest.domain.forest.dto;

import com.E205.cocos_forest.domain.forest.entity.Forest;
import com.E205.cocos_forest.domain.forest.entity.Tree;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 숲 조회 응답 DTO
 */
@Getter
@Builder
public class ForestResponseDto {
    
    private Long forestId;
    private Long userId;
    private Integer size;
    private Integer pondX;
    private Integer pondY;
    private Integer aliveTreeCount;
    private Integer deadHighlightCount;
    private List<TreeResponseDto> trees;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ForestResponseDto from(Forest forest) {
        return ForestResponseDto.builder()
                .forestId(forest.getId())
                .userId(forest.getUserId())
                .size(forest.getSize())
                .pondX(forest.getPondX())
                .pondY(forest.getPondY())
                .aliveTreeCount((int) forest.getTrees().stream().filter(tree -> !tree.getIsDead()).count())
                .deadHighlightCount((int) forest.getTrees().stream().filter(Tree::getDeadHighlight).count())
                .trees(forest.getTrees().stream()
                        .map(TreeResponseDto::from)
                        .collect(Collectors.toList()))
                .createdAt(forest.getCreatedAt())
                .updatedAt(forest.getUpdatedAt())
                .build();
    }
}
