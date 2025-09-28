package com.E205.cocos_forest.api.challenge.service.tumbler;

import com.E205.cocos_forest.api.challenge.dto.out.TumblerVerifyOut;
import com.E205.cocos_forest.api.forest.service.PointService;
import com.E205.cocos_forest.domain.challenge.entity.Challenge;
import com.E205.cocos_forest.domain.challenge.entity.UserChallenge;
import com.E205.cocos_forest.domain.challenge.repository.ChallengeRepository;
import com.E205.cocos_forest.domain.challenge.repository.UserChallengeRepository;
import com.E205.cocos_forest.global.external.clova.ClovaOcrClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TumblerVerificationServiceImpl implements TumblerVerificationService {

    private static final ZoneId ZONE_KST = ZoneId.of("Asia/Seoul");

    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final PointService pointService;
    private final ClovaOcrClient clovaOcrClient;
    private final ReceiptTextParser receiptTextParser;

    // 간단 키워드 목록 (공백/대소문자 무시)
    private static final String[] KEYWORDS = new String[]{
        "개인컵", "개인 컵", "텀블러", "머그컵", "매장컵"
    };

    @Override
    @Transactional
    public TumblerVerifyOut verifyAndAward(Long userId, MultipartFile file) {
        // 1) 챌린지 식별: category_id 우선("TUMBLER"), 없으면 title 에 "텀블러" 포함된 활성 챌린지 선택
        Challenge tumbler = findTumblerChallenge()
            .orElseThrow(() -> new IllegalStateException("Tumbler challenge not configured"));

        LocalDate today = LocalDate.now(ZONE_KST);
        UserChallenge uc = userChallengeRepository
            .findByUserIdAndChallengeIdAndChallengeDate(userId, tumbler.getId(), today)
            .orElseGet(() -> createPending(userId, tumbler, today));

//        // 이미 보상 지급된 경우 즉시 반환 (멱등) (테스팅용 생략)
//        if (uc.getRewardPoints() != null && uc.getRewardPoints() > 0) {
//            return TumblerVerifyOut.builder()
//                .success(true)
//                .reason("이미 인증 및 보상 완료")
//                .awarded(true)
//                .points(uc.getRewardPoints())
//                .userChallengeId(uc.getId())
//                .build();
//        }

        try (InputStream is = file.getInputStream()) {
            ClovaOcrClient.OcrResult ocr = clovaOcrClient.recognize(is, file.getContentType());

            String full = ocr.getFullText();

            // 1) 영수증 형태 여부 확인 (임의 텍스트 방지용 간단 휴리스틱)
            if (!receiptTextParser.looksLikeReceipt(full)) {
                return TumblerVerifyOut.builder()
                    .success(false)
                    .reason("영수증 형식이 인식되지 않았습니다")
                    .awarded(false)
                    .points(0)
                    .userChallengeId(uc.getId())
                    .build();
            }

//            // 2) 날짜 추출 및 금일과 일치 여부 확인 (테스팅용 생략)
//            Optional<LocalDate> receiptDate = receiptTextParser.extractReceiptDate(full, ZONE_KST);
//            if (receiptDate.isEmpty() || !receiptDate.get().isEqual(today)) {
//                return TumblerVerifyOut.builder()
//                    .success(false)
//                    .reason("영수증 날짜가 오늘과 일치하지 않습니다")
//                    .awarded(false)
//                    .points(0)
//                    .userChallengeId(uc.getId())
//                    .build();
//            }

            // 3) 개인컵 키워드 확인
            boolean pass = containsAnyKeyword(normalize(full));
            if (!pass) {
                // 실패 처리: 상태는 유지(PENDING) 하고 실패 사유만 반환
                return TumblerVerifyOut.builder()
                    .success(false)
                    .reason("영수증에서 '개인컵/텀블러' 문구를 찾지 못했습니다")
                    .awarded(false)
                    .points(0)
                    .userChallengeId(uc.getId())
                    .build();
            }

            // 성공: 상태 DONE + 포인트 지급(멱등)
            uc.setStatus(UserChallenge.Status.DONE);
            userChallengeRepository.save(uc);

            if (uc.getRewardPoints() == null || uc.getRewardPoints() == 0) {
                pointService.earnPoints(userId, tumbler.getRewardPoints(), "CHALLENGE_REWARD", uc.getId(), tumbler.getTitle());
                uc.setRewardPoints(tumbler.getRewardPoints());
                userChallengeRepository.save(uc);
            }

            return TumblerVerifyOut.builder()
                .success(true)
                .reason("인증 성공: 개인컵 사용 인식")
                .awarded(true)
                .points(uc.getRewardPoints())
                .userChallengeId(uc.getId())
                .build();

        } catch (Exception e) {
            log.warn("Tumbler OCR verification failed: {}", e.getMessage());
            return TumblerVerifyOut.builder()
                .success(false)
                .reason("OCR 처리 중 오류가 발생했습니다")
                .awarded(false)
                .points(0)
                .userChallengeId(uc.getId())
                .build();
        }
    }

    private Optional<Challenge> findTumblerChallenge() {
        // id 가 2인 경우 텀블러 인증 챌린지
        return challengeRepository.findById(2L);
    }

    private UserChallenge createPending(Long userId, Challenge ch, LocalDate date) {
        UserChallenge uc = new UserChallenge();
        uc.setUserId(userId);
        uc.setChallengeId(ch.getId());
        uc.setChallengeDate(date);
        uc.setStatus(UserChallenge.Status.PENDING);
        uc.setRewardPoints(0);
        return userChallengeRepository.save(uc);
    }

    private boolean containsAnyKeyword(String normalizedFullText) {
        for (String kw : KEYWORDS) {
            if (normalizedFullText.contains(normalize(kw))) return true;
        }
        return false;
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.toLowerCase(Locale.ROOT)
            .replaceAll("\\s+", ""); // 공백 제거, 소문자화
    }
}
