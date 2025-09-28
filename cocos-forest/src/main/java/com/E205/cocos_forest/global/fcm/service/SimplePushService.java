package com.E205.cocos_forest.global.fcm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimplePushService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // 하드코딩된 푸시 토큰들 (실제 토큰으로 교체하세요)
    private static final List<String> HARDCODED_PUSH_TOKENS = Arrays.asList(
        "ExponentPushToken[BvbSxZK4V_4QvcOx2n67y7]",
        "ExponentPushToken[bKSyTHLEB31DPzLZNBNr_X]"
    );
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    public void sendPaymentNotificationAsync(String merchantName, Long amount, String categoryName) {
        try {
            // 모든 토큰에 대해 알림 전송
            for (String token : HARDCODED_PUSH_TOKENS) {
                Map<String, Object> notification = new HashMap<>();
                notification.put("to", token);
                notification.put("title", "💳 결제 완료");
                notification.put("body", String.format("%s에서 %,d원 결제되었습니다 (%s)",
                    merchantName, amount, categoryName));
                notification.put("sound", "default");

                Map<String, Object> data = new HashMap<>();
                data.put("type", "payment");
                data.put("merchantName", merchantName);
                data.put("amount", amount);
                data.put("categoryName", categoryName);
                notification.put("data", data);

                sendNotification(notification, token);
            }

        } catch (Exception e) {
            log.error("결제 알림 전송 실패 - 가맹점: {}, 금액: {}, 오류: {}",
                merchantName, amount, e.getMessage());
        }
    }

    private void sendNotification(Map<String, Object> notification, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notification, headers);

            log.info("푸시 알림 전송 시작 - 토큰: {}..., 제목: {}",
                token.substring(0, Math.min(token.length(), 20)), notification.get("title"));
            String response = restTemplate.postForObject(EXPO_PUSH_URL, request, String.class);
            log.info("푸시 알림 전송 성공 - 토큰: {}..., 응답: {}",
                token.substring(0, Math.min(token.length(), 20)), response);

        } catch (Exception e) {
            log.error("푸시 알림 전송 실패 - 토큰: {}..., 오류: {}",
                token.substring(0, Math.min(token.length(), 20)), e.getMessage(), e);
        }
    }
}