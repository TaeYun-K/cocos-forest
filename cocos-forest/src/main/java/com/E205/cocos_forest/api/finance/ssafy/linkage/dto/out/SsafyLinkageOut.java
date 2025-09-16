// com/E205/cocos_forest/api/finance/dto/out/SsafyLinkageOut.java
package com.E205.cocos_forest.api.finance.ssafy.linkage.dto.out;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SsafyLinkageOut {
  private Long linkageId;
  private Long userId;
  private String orgCode;
  private String fintechAppNo;
  private String createdAt; // ISO_LOCAL_DATE_TIME 문자열
}
