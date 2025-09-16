package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.CardLinkOut;

public interface UserCardService {
    CardLinkOut linkCard(CardLinkCreateIn in);
}

