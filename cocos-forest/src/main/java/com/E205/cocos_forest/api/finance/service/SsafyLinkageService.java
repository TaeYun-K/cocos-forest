// com/E205/cocos_forest/api/finance/service/SsafyLinkageService.java
package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.in.SsafyLinkageCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.SsafyLinkageOut;

public interface SsafyLinkageService {
    SsafyLinkageOut createOrUpdate(SsafyLinkageCreateIn in);
    SsafyLinkageOut getByUserId(Long userId);
    void deleteByUserId(Long userId);
}
