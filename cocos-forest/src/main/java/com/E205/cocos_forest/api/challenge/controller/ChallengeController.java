package com.E205.cocos_forest.api.challenge.controller;

import com.E205.cocos_forest.api.challenge.dto.ChallengeTodayOut;
import com.E205.cocos_forest.api.challenge.service.ChallengeService;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "챌린지 API", description = "오늘의 챌린지 조회 API")
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @Operation(summary = "오늘의 챌린지 조회 api", description = "사용자의 오늘의 챌린지를 조회합니다")
    @GetMapping("/today")
    public BaseResponse<ChallengeTodayOut> getToday(@AuthenticationPrincipal CustomUserDetails principal) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(challengeService.getTodayChallenges(userId));
    }

    @Operation(summary = "챌린지 보상 수령", description = "해당 유저 챌린지 인스턴스의 보상을 수동 수령")
    @PostMapping("/{userChallengeId}/claim")
    public BaseResponse<String> claim(@AuthenticationPrincipal CustomUserDetails principal,
                                      @PathVariable Long userChallengeId) {
        Long userId = principal.getUser().getId();
        challengeService.claimReward(userId, userChallengeId);
        return new BaseResponse<>("OK");
    }
}

