package com.E205.cocos_forest.api.finance.dto.out;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class BankOut {
    private String bankCode;
    private String bankName;
}
