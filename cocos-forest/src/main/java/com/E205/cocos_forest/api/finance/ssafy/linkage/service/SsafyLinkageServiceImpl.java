package com.E205.cocos_forest.api.finance.ssafy.linkage.service;

import com.E205.cocos_forest.api.finance.ssafy.linkage.dto.out.SsafyLinkageOut;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkage;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkageRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.external.ssafy.SsafyGateway;
import com.E205.cocos_forest.global.external.ssafy.config.SsafyProperties;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional
public class SsafyLinkageServiceImpl implements SsafyLinkageService {

    private final SsafyLinkageRepository repository;
    private final SsafyGateway ssafyGateway;
    private final SsafyProperties props; // ✅ 환경값 주입 (apiKey/orgCode/fintechAppNo/baseUrl)

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * 이메일을 SSAFY에 등록(또는 조회)하고 userKey를 받아 linkage upsert
     * @param in     userEmail만 포함한 DTO
     */
    @Override
    public SsafyLinkageOut registerByEmail(Long userId, String email) {
        if (email == null || email.isBlank()) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        // 1) SSAFY 외부 API 호출 → userKey 획득
        String userKey = ssafyGateway.registerAndGetUserKey(email);
        if (userKey == null || userKey.isBlank()) {
            throw new BaseException(BaseResponseStatus.EXTERNAL_API_ERROR);
        }

        // 2) linkage upsert
        SsafyLinkage entity = repository.findByUserId(userId)
            .orElseGet(() -> SsafyLinkage.builder().userId(userId).build());

        entity.setApiKey(props.getApiKey());             // 서버 보관(고정값)
        entity.setUserKey(userKey);                      // SSAFY 발급 userKey
        entity.setInstitutionCode(props.getInstitutionCode());           // ex) "00100"
        entity.setFintechAppNo(props.getFintechAppNo()); // ex) "001"

        SsafyLinkage saved = repository.save(entity);

        return SsafyLinkageOut.builder()
            .linkageId(saved.getId())
            .userId(saved.getUserId())
            .orgCode(saved.getInstitutionCode())
            .fintechAppNo(saved.getFintechAppNo())
            .createdAt(saved.getCreatedAt().format(ISO))
            .build();
    }

    @Override
    public boolean searchUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        // SSAFY 외부 API 호출 → 사용자 존재 여부 확인
        return ssafyGateway.searchUser(email);
    }

    @Override
    @Transactional(readOnly = true)
    public SsafyLinkageOut getByUserId(Long userId) {
        SsafyLinkage s = repository.findByUserId(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.LINKAGE_NOT_FOUND));

        return SsafyLinkageOut.builder()
            .linkageId(s.getId())
            .userId(s.getUserId())
            .orgCode(s.getInstitutionCode())
            .fintechAppNo(s.getFintechAppNo())
            .createdAt(s.getCreatedAt().format(ISO))
            .build();
    }
}
