package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.in.CardPaymentCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardPaymentOut;
import com.E205.cocos_forest.domain.finance.card.UserCard;
import com.E205.cocos_forest.domain.finance.card.UserCardRepository;
import com.E205.cocos_forest.domain.finance.card.transaction.CardTransaction;
import com.E205.cocos_forest.domain.finance.card.transaction.CardTransactionRepository;
import com.E205.cocos_forest.domain.finance.merchant.MerchantRepository;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkage;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkageRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.external.ssafy.SsafyGateway;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardTransactionCreateResult;
import com.E205.cocos_forest.global.fcm.service.SimplePushService;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Transactional
public class CardPaymentServiceImpl implements CardPaymentService {

    private final UserCardRepository userCardRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final SimplePushService simplePushService;
    private final SsafyLinkageRepository ssafyLinkageRepository;
    private final SsafyGateway ssafyGateway;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public CardPaymentOut pay(Long userId, CardPaymentCreateIn in) {
        if (userId == null || in == null || in.getMerchantId() == null || in.getPaymentBalance() == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        // 기본(최근) 카드 선택 및 소유권 검증
        UserCard userCard = userCardRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_CARD_NOT_LINKED));
        if (!userCard.getUserId().equals(userId)) {
            throw new BaseException(BaseResponseStatus.NO_ACCESS_AUTHORITY, "Forbidden card access");
        }

        // 사용자 SSAFY 연동 정보 조회
        String userKey = ssafyLinkageRepository.findByUserId(userId)
            .map(SsafyLinkage::getUserKey)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.LINKAGE_NOT_FOUND));

        // cardNo, cvc 로 결제 API 호출
        var list = ssafyGateway.inquireSignUpCreditCardList(userKey); // ssafy api 에서 userKey로 연결된 카드 목록 조회
        if (list == null || list.isEmpty()) {
            throw new BaseException(BaseResponseStatus.EXTERNAL_API_ERROR, "No cards from SSAFY");
        }
        var matched = list.stream()
            .filter(i -> userCard.getCardUniqueNo().equals(i.getCardUniqueNo())) // userCardId로 찾은 카드 고유 번호로 매핑
            .findFirst()
            .orElse(list.get(0));
        String cardNo = matched.getCardNo();
        String cvc = matched.getCvc();

        // 결제 API 호출
        String amountStr = String.valueOf(in.getPaymentBalance());
        CreditCardTransactionCreateResult res = ssafyGateway.createCreditCardTransaction(
            userKey,
            cardNo,
            cvc,
            String.valueOf(in.getMerchantId()),
            amountStr
        );

        if (res == null || !StringUtils.hasText(res.getTransactionUniqueNo())) {
            throw new BaseException(BaseResponseStatus.EXTERNAL_API_ERROR, "Failed to create credit card transaction");
        }

        // transation DB entity 생성 및 저장
        CardTransaction tx = new CardTransaction();
        tx.setUserId(userId);
        tx.setCategoryId(res.getCategoryId());
        tx.setTransactionNo(res.getTransactionUniqueNo());
        tx.setCardLast4(userCard.getLast4());
        tx.setIssueCode(userCard.getIssuerCode());
        tx.setCardName(userCard.getCardName());
        try {
            tx.setMerchantId(Long.valueOf(res.getMerchantId()));
        } catch (Exception e) {
            tx.setMerchantId(in.getMerchantId());
        }
        // parse date/time
        LocalDate txDate = parseDate(res.getTransactionDate());
        LocalTime txTime = parseTime(res.getTransactionTime());
        tx.setTxDate(txDate != null ? txDate : LocalDate.now(ZoneId.of("Asia/Seoul")));
        tx.setTxTime(txTime);
        tx.setAmountKrw(safeParseLong(res.getPaymentBalance(), in.getPaymentBalance()));
        tx.setStatus(CardTransaction.Status.APPROVED);
        try {
            tx.setRawResponse(objectMapper.writeValueAsString(res));
        } catch (JsonProcessingException e) {
            tx.setRawResponse(null);
        }
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        tx.setCreatedAt(now);
        tx.setUpdatedAt(now);

        CardTransaction saved = cardTransactionRepository.save(tx);

        // 결제 알림 전송 - 하드코딩된 디바이스로만 전송하기
        simplePushService.sendPaymentNotificationAsync(res.getMerchantName(),
            Long.valueOf(res.getPaymentBalance()), res.getCategoryName());

        return CardPaymentOut.builder()
            .transactionUniqueNo(res.getTransactionUniqueNo())
            .categoryId(res.getCategoryId())
            .categoryName(res.getCategoryName())
            .merchantId(saved.getMerchantId())
            .merchantName(res.getMerchantName())
            .transactionDate(res.getTransactionDate())
            .transactionTime(res.getTransactionTime())
            .paymentBalance(saved.getAmountKrw())
            .savedTransactionId(saved.getId())
            .status(CardTransaction.Status.APPROVED.name())
            .build();
    }

    // yyyyMMdd 을 LocalDate 형식으로 변환
    private LocalDate parseDate(String yyyymmdd) {
        try {
            if (!StringUtils.hasText(yyyymmdd) || yyyymmdd.length() != 8) return null;
            int y = Integer.parseInt(yyyymmdd.substring(0, 4));
            int m = Integer.parseInt(yyyymmdd.substring(4, 6));
            int d = Integer.parseInt(yyyymmdd.substring(6, 8));
            return LocalDate.of(y, m, d);
        } catch (Exception e) { return null; }
    }

    // HHHmmss 를 LocalTime 형식으로 변환
    private LocalTime parseTime(String hhmmss) {
        try {
            if (!StringUtils.hasText(hhmmss) || hhmmss.length() != 6) return null;
            int h = Integer.parseInt(hhmmss.substring(0, 2));
            int m = Integer.parseInt(hhmmss.substring(2, 4));
            int s = Integer.parseInt(hhmmss.substring(4, 6));
            return LocalTime.of(h, m, s);
        } catch (Exception e) { return null; }
    }

    // Long 형식으로 변환
    private long safeParseLong(String v, Long fallback) {
        try { return v == null ? fallback : Long.parseLong(v); } catch (Exception e) { return fallback; }
    }
}
