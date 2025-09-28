package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
import com.E205.cocos_forest.api.finance.card.dto.out.UserCardOut;

import java.util.List;

public interface UserCardService {
    CardLinkOut linkCard(Long userId, CardLinkCreateIn in);
    List<UserCardOut> getUserCards(Long userId);
}
