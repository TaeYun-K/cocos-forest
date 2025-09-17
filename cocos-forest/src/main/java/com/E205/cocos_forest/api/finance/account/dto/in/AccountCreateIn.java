package com.E205.cocos_forest.api.finance.account.dto.in;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AccountCreateIn {
    @NotBlank(message = "계좌 유형 고유번호는 필수입니다.")
    private String accountTypeUniqueNo;
}
