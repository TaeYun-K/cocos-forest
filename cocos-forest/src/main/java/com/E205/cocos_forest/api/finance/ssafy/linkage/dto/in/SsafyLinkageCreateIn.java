// com/E205/cocos_forest/api/finance/dto/in/SsafyLinkageCreateIn.java
package com.E205.cocos_forest.api.finance.ssafy.linkage.dto.in;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SsafyLinkageCreateIn {
  @NotBlank @Email
  private String userEmail;
}
