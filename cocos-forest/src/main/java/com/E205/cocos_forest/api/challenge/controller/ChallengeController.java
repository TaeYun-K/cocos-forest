package com.E205.cocos_forest.api.challenge.controller;

import com.E205.cocos_forest.api.challenge.dto.ChallengeTodayOut;
import com.E205.cocos_forest.api.challenge.service.ChallengeService;
import com.E205.cocos_forest.global.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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
    public BaseResponse<ChallengeTodayOut> getToday(@RequestParam Long userId) {
        return new BaseResponse<>(challengeService.getTodayChallenges(userId));
    }
}

