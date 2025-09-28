// PushTokenController.java
package com.E205.cocos_forest.global.fcm.controller;

import com.E205.cocos_forest.global.fcm.dto.PushTokenRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PushTokenController {
    private static final Logger log = LoggerFactory.getLogger(PushTokenController.class);

    // Expo 푸시 토큰 정규식 (ExponentPushToken[...] 형태)
    private static final String EXPO_TOKEN_REGEX = "^ExponentPushToken\\[[A-Za-z0-9_\\-]+\\]$";

    @PostMapping("/push-token")
    public ResponseEntity<String> savePushToken(
            @Valid @RequestBody PushTokenRequest req,
            @RequestHeader(value = "X-Client-Build", required = false) String clientBuild
    ) {
        if (!StringUtils.hasText(req.token())) {
            return ResponseEntity.badRequest().body("token is required");
        }
        // 에뮬레이터용 mock은 허용, 실기기면 형식 검증
        boolean isEmulatorMock = req.token().startsWith("ExponentPushToken[EMULATOR_MOCK_]");
        if (!isEmulatorMock && !req.token().matches(EXPO_TOKEN_REGEX)) {
            return ResponseEntity.badRequest().body("invalid expo token format");
        }

        // ✅ 서버 로그로 남기기 (필요한 메타데이터 포함)
        log.info("ExpoPushToken received | userId={} deviceType={} token={} deviceInfo={} clientBuild={}",
                req.userId(), req.deviceType(), req.token(), req.deviceInfo(), clientBuild);

        // (선택) DB upsert/중복관리: userId별 최신 토큰 저장
        // pushTokenService.upsert(req.userId(), req.token(), req.deviceType(), req.deviceInfo());

        return ResponseEntity.ok("ok");
    }
}
