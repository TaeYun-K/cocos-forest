package com.E205.cocos_forest.api.finance.dto.out;

import com.E205.cocos_forest.domain.account.UserAccount;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserAccountOut {
    private Long accountId;
    private Long userId;
    private String accountNo;
    private String bankCode;
    private String accountTypeUniqueNo;
    private String currency;
    private String currencyName;
    private UserAccount.AccountStatus status;
    private String createdAt;
}
