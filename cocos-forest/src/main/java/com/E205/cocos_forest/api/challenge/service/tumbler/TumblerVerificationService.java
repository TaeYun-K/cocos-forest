package com.E205.cocos_forest.api.challenge.service.tumbler;

import com.E205.cocos_forest.api.challenge.dto.out.TumblerVerifyOut;
import org.springframework.web.multipart.MultipartFile;

public interface TumblerVerificationService {
    TumblerVerifyOut verifyAndAward(Long userId, MultipartFile file);
}

