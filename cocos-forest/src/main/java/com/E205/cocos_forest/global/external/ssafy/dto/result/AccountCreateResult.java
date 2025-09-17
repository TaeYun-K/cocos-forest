package com.E205.cocos_forest.global.external.ssafy.dto.result;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AccountCreateResult {
    private String bankCode;
    private String accountNo;
    private Currency currency;
    
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Currency {
        private String currency;
        private String currencyName;
    }
}
