package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.in.CardPaymentCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardPaymentOut;

public interface CardPaymentService {
    CardPaymentOut pay(Long userId, CardPaymentCreateIn in);
}

