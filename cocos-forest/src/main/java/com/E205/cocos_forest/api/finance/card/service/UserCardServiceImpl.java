package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
import com.E205.cocos_forest.api.finance.card.dto.out.UserCardOut;
import com.E205.cocos_forest.domain.finance.card.CardProduct;
import com.E205.cocos_forest.domain.finance.card.CardProductRepository;
import com.E205.cocos_forest.domain.finance.card.UserCard;
import com.E205.cocos_forest.domain.finance.card.UserCardRepository;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkageRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.external.ssafy.SsafyGateway;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserCardServiceImpl implements UserCardService {

    private final SsafyGateway ssafyGateway;
    private final SsafyLinkageRepository linkageRepository;
    private final CardProductRepository productRepository;
    private final UserCardRepository userCardRepository;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public CardLinkOut linkCard(Long userId, CardLinkCreateIn in) {
        if (in == null || in.getProductId() == null || in.getWithdrawalAccountNo() == null || in.getWithdrawalDate() == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        var linkage = linkageRepository.findByUserId(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.LINKAGE_NOT_FOUND));

        CardProduct product = productRepository.findById(in.getProductId())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_NOTICE)); // reuse NOT_FOUND code; adjust if needed

        // Prevent duplicate link for the same user and card (by cardUniqueNo / product)
        userCardRepository.findByUserIdAndCardUniqueNo(userId, product.getCardUniqueNo())
            .ifPresent(existing -> {
                throw new BaseException(BaseResponseStatus.DATABASE_CONSTRAINT_VIOLATION, "이미 연결된 카드입니다.");
            });

        // Normalize withdrawalDate to SSAFY expected format (day of month: 1~31 as string)
        String normalizedWithdrawalDay = normalizeWithdrawalDate(in.getWithdrawalDate());
        if (normalizedWithdrawalDay == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "출금날짜 형식이 올바르지 않습니다. (허용: 1~7)");
        }

        // Call SSAFY credit card create API
        CreditCardCreateResult res = ssafyGateway.createCreditCard(
            linkage.getUserKey(),
            product.getCardUniqueNo(),
            in.getWithdrawalAccountNo(),
            normalizedWithdrawalDay
        );

        if (res == null || res.getCardNo() == null || res.getCardNo().isBlank()) {
            throw new BaseException(BaseResponseStatus.EXTERNAL_API_ERROR);
        }

        String last4 = res.getCardNo().length() >= 4 ? res.getCardNo().substring(res.getCardNo().length()-4) : res.getCardNo();
        String masked = maskCardNo(res.getCardNo());

        UserCard entity = UserCard.builder()
            .userId(userId)
            .product(product)
            .cardUniqueNo(product.getCardUniqueNo())
            .issuerCode(res.getCardIssuerCode())
            .issuerName(res.getCardIssuerName())
            .cardName(res.getCardName())
            .cardNoMasked(masked)
            .last4(last4)
            .expiryYmd(res.getCardExpiryDate())
            .withdrawalAccountNo(res.getWithdrawalAccountNo())
            .withdrawalDay(Byte.valueOf(res.getWithdrawalDate()))
            .baselinePerformance(res.getBaselinePerformance())
            .maxBenefitLimit(res.getMaxBenefitLimit())
            .cardDescription(res.getCardDescription())
            .status(UserCard.Status.ACTIVE)
            .build();

        UserCard saved = userCardRepository.save(entity);

        return CardLinkOut.builder()
            .userCardId(saved.getUserCardId())
            .userId(saved.getUserId())
            .productId(saved.getProduct().getProductId())
            .cardUniqueNo(saved.getCardUniqueNo())
            .issuerCode(saved.getIssuerCode())
            .issuerName(saved.getIssuerName())
            .cardName(saved.getCardName())
            .cardNoMasked(saved.getCardNoMasked())
            .last4(saved.getLast4())
            .expiryYmd(saved.getExpiryYmd())
            .withdrawalAccountNo(saved.getWithdrawalAccountNo())
            .withdrawalDate(normalizedWithdrawalDay)
            .baselinePerformance(saved.getBaselinePerformance())
            .maxBenefitLimit(saved.getMaxBenefitLimit())
            .cardDescription(saved.getCardDescription())
            .status(saved.getStatus())
            .build();
    }

    private String maskCardNo(String cardNo) {
        if (cardNo == null || cardNo.length() < 8) return "****";
        int visible = 4;
        String last4 = cardNo.substring(cardNo.length()-visible);
        return "************" + last4;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserCardOut> getUserCards(Long userId) {
        List<UserCard> cards = userCardRepository.findByUserId(userId);
        // Deduplicate by productId to avoid showing duplicates of the same card product
        java.util.Set<Long> seenProductIds = new java.util.HashSet<>();
        return cards.stream()
                .filter(uc -> uc.getProduct() != null && seenProductIds.add(uc.getProduct().getProductId()))
                .map(this::toOut)
                .toList();
    }

    /**
     * 내 카드 목록 조회 dtd 만드는 클래스
     */
    private UserCardOut toOut(UserCard uc) {
        return UserCardOut.builder()
                .userCardId(uc.getUserCardId())
                .userId(uc.getUserId())
                .productId(uc.getProduct() != null ? uc.getProduct().getProductId() : null)
                .cardUniqueNo(uc.getCardUniqueNo())
                .issuerCode(uc.getIssuerCode())
                .issuerName(uc.getIssuerName())
                .cardName(uc.getCardName())
                .cardNoMasked(uc.getCardNoMasked())
                .last4(uc.getLast4())
                .expiryYmd(uc.getExpiryYmd())
                .withdrawalAccountNo(uc.getWithdrawalAccountNo())
                .withdrawalDay(uc.getWithdrawalDay())
                .baselinePerformance(uc.getBaselinePerformance())
                .maxBenefitLimit(uc.getMaxBenefitLimit())
                .cardDescription(uc.getCardDescription())
                .status(uc.getStatus())
                .createdAt(uc.getCreatedAt() != null ? uc.getCreatedAt().format(ISO) : null)
                .build();
    }

    private String normalizeWithdrawalDate(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;

        // Case 1: YYYY-MM-DD -> extract day part
        if (s.matches("\\d{4}-\\d{2}-\\d{2}")) {
            String dayStr = s.substring(8, 10); // DD
            try {
                int day = Integer.parseInt(dayStr);
                if (day >= 1 && day <= 31) return Integer.toString(day); // no leading zero
                return null;
            } catch (NumberFormatException ignored) { return null; }
        }

        // Case 2: 1~31 (optionally with leading zero)
        if (s.matches("\\d{1,2}")) {
            try {
                int day = Integer.parseInt(s);
                if (day >= 1 && day <= 31) return Integer.toString(day);
                return null;
            } catch (NumberFormatException ignored) { return null; }
        }

        return null;
    }
}
