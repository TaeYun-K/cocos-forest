package com.E205.cocos_forest.api.finance.dto.out;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AccountCreateOut {
    private String bankCode;
    private String accountNo;
    private String currency;
    private String currencyName;
    private String createdAt;
}
