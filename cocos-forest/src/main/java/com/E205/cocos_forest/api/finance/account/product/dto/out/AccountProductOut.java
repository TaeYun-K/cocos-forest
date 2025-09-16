package com.E205.cocos_forest.api.finance.account.product.dto.out;

import com.E205.cocos_forest.domain.finance.account.AccountProduct;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AccountProductOut {
    private Long productId;
    private String accountTypeUniqueNo;
    private String bankCode;
    private String bankName;
    private String accountTypeCode;
    private String accountTypeName;
    private String accountName;
    private String accountDescription;
    private AccountProduct.AccountType accountType;
    private String createdAt;
}
