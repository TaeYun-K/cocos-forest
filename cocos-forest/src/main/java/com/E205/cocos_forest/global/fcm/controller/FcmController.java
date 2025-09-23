package com.E205.cocos_forest.global.fcm.controller;

import com.E205.cocos_forest.global.fcm.dto.MessageRequestDTO;
import com.E205.cocos_forest.global.fcm.service.FcmService;
import com.E205.cocos_forest.global.response.BaseResponse;
import com.google.firebase.messaging.FirebaseMessagingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/fcm")
@Tag(name = "FCM", description = "Firebase Cloud Messaging API")
public class FcmController {

    private final FcmService fcmService;

    @Operation(summary = "토픽으로 FCM 메시지 전송", description = "특정 토픽을 구독한 모든 사용자에게 푸시 알림을 전송합니다.")
    @PostMapping("/topic")
    public BaseResponse<Void> sendMessageTopic(@RequestBody MessageRequestDTO requestDTO) {
        try {
            log.info("토픽 메시지 전송 요청 - 제목: {}, 내용: {}", requestDTO.getTitle(), requestDTO.getBody());

            fcmService.sendMessageByTopic(requestDTO.getTitle(), requestDTO.getBody());

            log.info("토픽 메시지 전송 성공");
            return new BaseResponse<>();

        } catch (IOException e) {
            log.error("FCM 토픽 메시지 전송 중 IO 오류 발생", e);
            throw new RuntimeException("FCM 서비스 연결 실패", e);
        } catch (FirebaseMessagingException e) {
            log.error("FCM 토픽 메시지 전송 실패", e);
            throw new RuntimeException("메시지 전송 실패: " + e.getMessage(), e);
        }
    }

    @Operation(summary = "개별 토큰으로 FCM 메시지 전송", description = "특정 사용자의 기기 토큰으로 개인화된 푸시 알림을 전송합니다.")
    @PostMapping("/token")
    public BaseResponse<Void> sendMessageToken(@RequestBody MessageRequestDTO requestDTO) {
        try {
            log.info("개별 토큰 메시지 전송 요청 - 제목: {}, 내용: {}, 토큰: {}",
                            requestDTO.getTitle(), requestDTO.getBody(),
                            requestDTO.getTargetToken().substring(0, 10) + "...");

            fcmService.sendMessageByToken(requestDTO.getTitle(), requestDTO.getBody(), requestDTO.getTargetToken());

            log.info("개별 토큰 메시지 전송 성공");
            return new BaseResponse<>();

        } catch (FirebaseMessagingException e) {
            log.error("FCM 개별 메시지 전송 실패", e);
            throw new RuntimeException("메시지 전송 실패: " + e.getMessage(), e);
        }
    }
}
