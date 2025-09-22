package com.E205.cocos_forest.api.challenge.service;

import com.E205.cocos_forest.api.challenge.dto.TumblerVerifyOut;
import org.springframework.web.multipart.MultipartFile;

public interface TumblerVerificationService {
    TumblerVerifyOut verifyAndAward(Long userId, MultipartFile file);
}

