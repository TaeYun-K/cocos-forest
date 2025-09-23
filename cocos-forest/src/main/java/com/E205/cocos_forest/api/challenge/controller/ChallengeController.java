package com.E205.cocos_forest.api.challenge.controller;

import com.E205.cocos_forest.api.challenge.dto.out.ChallengeTodayOut;
import com.E205.cocos_forest.api.challenge.dto.out.TumblerVerifyOut;
import com.E205.cocos_forest.api.challenge.service.challenge.ChallengeService;
import com.E205.cocos_forest.api.challenge.service.tumbler.TumblerVerificationService;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import com.E205.cocos_forest.global.response.BaseResponse;
import com.E205.cocos_forest.api.challenge.dto.in.StepsUpdateIn;
import com.E205.cocos_forest.api.challenge.dto.out.StepsUpdateOut;
import com.E205.cocos_forest.api.challenge.service.step.StepService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.MediaType;
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
    private final TumblerVerificationService tumblerVerificationService;
    private final StepService stepService;

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

    @Operation(summary = "텀블러 영수증 OCR 인증", description = "이미지를 디스크에 저장하지 않고 바로 OCR로 전송해 판정")
    @PostMapping(value = "/tumbler/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BaseResponse<TumblerVerifyOut> verifyTumbler(
        @AuthenticationPrincipal CustomUserDetails principal,
        @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        Long userId = principal.getUser().getId();
        TumblerVerifyOut out = tumblerVerificationService.verifyAndAward(userId, file);
        return new BaseResponse<>(out);
    }


    @Operation(summary = "오늘 걸음수 갱신", description = "프론트에서 전달한 오늘의 총 걸음수로 저장합니다")
    @PostMapping("/steps")
    public BaseResponse<StepsUpdateOut> updateTodaySteps(
        @AuthenticationPrincipal CustomUserDetails principal,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "오늘의 총 걸음수")
        @org.springframework.web.bind.annotation.RequestBody StepsUpdateIn in
    ) {
        Long userId = principal.getUser().getId();
        StepsUpdateOut out = stepService.updateTodaySteps(userId, in.getSteps());
        challengeService.evaluateStepsChallenge(userId);
        return new BaseResponse<>(out);
    }
}
