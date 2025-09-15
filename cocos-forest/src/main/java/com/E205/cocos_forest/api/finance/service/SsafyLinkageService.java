// com/E205/cocos_forest/api/finance/service/SsafyLinkageService.java
package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.in.SsafyLinkageCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.SsafyLinkageOut;

public interface SsafyLinkageService {
    // 이메일로 SSAFY 등록 → userKey 수령 → linkage upsert
    SsafyLinkageOut registerByEmail(SsafyLinkageCreateIn in);

    // 이메일로 SSAFY 사용자 검색
    boolean searchUserByEmail(SsafyLinkageCreateIn in);
    
    SsafyLinkageOut getByUserId(Long userId);
}
