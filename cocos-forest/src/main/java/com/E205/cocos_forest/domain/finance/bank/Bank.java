package com.E205.cocos_forest.domain.finance.bank;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Bank {

    @Id
    @Column(name = "bank_code", length = 10)
    private String bankCode;

    @Column(name = "bank_name", nullable = false, length = 50)
    private String bankName;
}
