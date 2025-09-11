// com/E205/cocos_forest/api/finance/dto/in/SsafyLinkageCreateIn.java
package com.E205.cocos_forest.api.finance.dto.in;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SsafyLinkageCreateIn {

  @NotNull
  private Long userId;

  @NotBlank
  private String apiKey;

  @NotBlank
  private String userKey;

  // 선택 입력 (null 시 DB default 사용)
  private String orgCode;        // ex) "00100"
  private String fintechAppNo;   // ex) "001"
}
