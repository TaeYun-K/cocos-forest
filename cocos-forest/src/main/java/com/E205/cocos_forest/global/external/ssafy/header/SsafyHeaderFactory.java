// global/external/ssafy/header/SsafyHeaderFactory.java
package com.E205.cocos_forest.global.external.ssafy.header;

import com.E205.cocos_forest.global.external.ssafy.config.SsafyProperties;
import com.E205.cocos_forest.global.external.ssafy.header.SsafyHeader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SsafyHeaderFactory {

    private final SsafyProperties props;

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HHmmss");

    public SsafyHeader create(String apiName, String apiServiceCode, String userKeyNullable) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        return SsafyHeader.builder()
                .apiName(apiName)
                .apiServiceCode(apiServiceCode)
                .transmissionDate(now.format(DATE))
                .transmissionTime(now.format(TIME))
                .institutionCode(props.getInstitutionCode())       // ← properties에서 고정값 주입
                .fintechAppNo(props.getFintechAppNo())     // ← properties에서 고정값 주입
                .institutionTransactionUniqueNo(genTxnId())// 매 요청 유니크 ID
                .apiKey(props.getApiKey())                 // ← properties에서 고정값 주입
                .userKey(userKeyNullable)                  // 해당 API가 필요할 때만 세팅
                .build();
    }

    private String genTxnId() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        String timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random6 = String.format("%06d", (int)(Math.random() * 1_000_000));
        return timestamp + random6; // 총 20자리
    }
}
