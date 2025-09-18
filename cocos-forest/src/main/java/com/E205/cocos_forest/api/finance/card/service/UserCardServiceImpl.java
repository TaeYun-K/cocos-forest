package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
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

@Service
@RequiredArgsConstructor
@Transactional
public class UserCardServiceImpl implements UserCardService {

    private final SsafyGateway ssafyGateway;
    private final SsafyLinkageRepository linkageRepository;
    private final CardProductRepository productRepository;
    private final UserCardRepository userCardRepository;

    @Override
    public CardLinkOut linkCard(Long userId, CardLinkCreateIn in) {
        if (in == null || in.getProductId() == null || in.getWithdrawalAccountNo() == null || in.getWithdrawalDate() == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        var linkage = linkageRepository.findByUserId(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.LINKAGE_NOT_FOUND));

        CardProduct product = productRepository.findById(in.getProductId())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.NO_EXIST_NOTICE)); // reuse NOT_FOUND code; adjust if needed

        // Call SSAFY credit card create API
        CreditCardCreateResult res = ssafyGateway.createCreditCard(
            linkage.getUserKey(),
            product.getCardUniqueNo(),
            in.getWithdrawalAccountNo(),
            in.getWithdrawalDate()
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
            .withdrawalDate(in.getWithdrawalDate())
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
}
