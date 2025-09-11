package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.in.SsafyLinkageCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.SsafyLinkageOut;
import com.E205.cocos_forest.domain.ssafy.SsafyLinkage;
import com.E205.cocos_forest.domain.ssafy.SsafyLinkageRepository;
import com.E205.cocos_forest.global.exception.BaseException;
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
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public SsafyLinkageOut createOrUpdate(SsafyLinkageCreateIn in) {
        if (in.getUserId() == null || in.getApiKey() == null || in.getUserKey() == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE); // 전역핸들러에서 400 매핑 :contentReference[oaicite:6]{index=6}
        }

        SsafyLinkage entity = repository.findByUserId(in.getUserId())
            .orElseGet(() -> SsafyLinkage.builder().userId(in.getUserId()).build());

        entity.setApiKey(in.getApiKey());
        entity.setUserKey(in.getUserKey());
        if (in.getOrgCode() != null && !in.getOrgCode().isBlank()) entity.setOrgCode(in.getOrgCode());
        if (in.getFintechAppNo() != null && !in.getFintechAppNo().isBlank()) entity.setFintechAppNo(in.getFintechAppNo());

        SsafyLinkage saved = repository.save(entity);

        return SsafyLinkageOut.builder()
            .linkageId(saved.getId())
            .userId(saved.getUserId())
            .orgCode(saved.getOrgCode())
            .fintechAppNo(saved.getFintechAppNo())
            .createdAt(saved.getCreatedAt().format(ISO))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SsafyLinkageOut getByUserId(Long userId) {
        SsafyLinkage s = repository.findByUserId(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND)); // 404 매핑 :contentReference[oaicite:7]{index=7}
        return SsafyLinkageOut.builder()
            .linkageId(s.getId())
            .userId(s.getUserId())
            .orgCode(s.getOrgCode())
            .fintechAppNo(s.getFintechAppNo())
            .createdAt(s.getCreatedAt().format(ISO))
            .build();
    }

    @Override
    public void deleteByUserId(Long userId) {
        repository.findByUserId(userId)
            .ifPresentOrElse(repository::delete,
                () -> { throw new BaseException(BaseResponseStatus.USER_NOT_FOUND); });
    }
}
