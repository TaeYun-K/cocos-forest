package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;

public interface UserCardService {
    CardLinkOut linkCard(CardLinkCreateIn in);
}
