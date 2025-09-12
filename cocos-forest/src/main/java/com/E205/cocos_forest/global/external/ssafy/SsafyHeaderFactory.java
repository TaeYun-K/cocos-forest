// global/external/ssafy/SsafyHeaderFactory.java
package com.E205.cocos_forest.global.external.ssafy;

import com.E205.cocos_forest.global.external.ssafy.dto.SsafyHeader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SsafyHeaderFactory {

    private final SsafyProperties props;

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HHmmss");

    public SsafyHeader create(String apiName, String apiServiceCode, String userKeyNullable) {
        LocalDateTime now = LocalDateTime.now();
        return SsafyHeader.builder()
                .apiName(apiName)
                .apiServiceCode(apiServiceCode)
                .transmissionDate(now.format(DATE))
                .transmissionTime(now.format(TIME))
                .institutionCode(props.getOrgCode())       // ← properties에서 고정값 주입
                .fintechAppNo(props.getFintechAppNo())     // ← properties에서 고정값 주입
                .institutionTransactionUniqueNo(genTxnId())// 매 요청 유니크 ID
                .apiKey(props.getApiKey())                 // ← properties에서 고정값 주입
                .userKey(userKeyNullable)                  // 해당 API가 필요할 때만 세팅
                .build();
    }

    private String genTxnId() {
        // 명세 규칙에 맞게 구성 (예: yyyymmddHHmmss + 난수 등)
        return UUID.randomUUID().toString().replace("-", "");
    }
}
