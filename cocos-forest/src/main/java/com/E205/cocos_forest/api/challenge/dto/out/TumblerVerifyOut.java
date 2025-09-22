package com.E205.cocos_forest.api.challenge.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TumblerVerifyOut {
    private boolean success;       // OCR/규칙 통과 여부
    private String reason;         // 실패 사유 또는 성공 설명
    private boolean awarded;       // 포인트 지급 여부
    private Integer points;        // 지급 포인트(성공 시)
    private Long userChallengeId;  // 오늘의 해당 챌린지 인스턴스 ID
}

