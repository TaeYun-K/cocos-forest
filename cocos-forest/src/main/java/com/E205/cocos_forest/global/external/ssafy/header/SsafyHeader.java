// global/external/ssafy/header/SsafyHeader.java
package com.E205.cocos_forest.global.external.ssafy.header;

import lombok.*;

/**
 * SSAFY api 를 호출 할 때, 고정값을 담음
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SsafyHeader {
    private String apiName;
    private String transmissionDate;
    private String transmissionTime;
    private String institutionCode;
    private String fintechAppNo;
    private String apiServiceCode;
    private String institutionTransactionUniqueNo;
    private String apiKey;
    private String userKey; // 일부 API는 불필요 → null 허용
}
