package com.E205.cocos_forest.global.external.clova;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.clova.ocr")
public class ClovaProperties {
    /**
     * OCR 호출 엔드포인트(전체 URL). 예: https://...apigw.ntruss.com/custom/v1/xxxx/yyyy
     */
    private String baseUrl;

    /**
     * X-OCR-SECRET 값
     */
    private String secretKey;

    private Integer connectTimeoutMs = 5000;
    private Integer readTimeoutMs = 20000; // Clova OCR 처리 시간이 길 수 있어 기본 20초
    private Integer maxRetries = 1;        // 연결/타임아웃 시 재시도 횟수
    private Long retryBackoffMs = 300L;    // 재시도 백오프(ms)
    private Boolean requireHttps = true;   // baseUrl이 HTTPS가 아니면 거부

    // 요청 포맷 관련 옵션 (모델에 따라 V1/V2 요구가 다를 수 있음)
    private String version = "V2";         // V1 또는 V2
    private String imageName = "upload";   // images[*].name 값
    private String lang = "ko";            // 선택: ko/en/jp
    private java.util.List<String> templateIds; // 선택: 특정 커스텀 템플릿 지정을 요구할 때
}
