package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardCategoryMonthlyDetailsOut;
import com.E205.cocos_forest.domain.finance.carbon.EmissionFactor;
import com.E205.cocos_forest.domain.finance.carbon.EmissionFactorRepository;
import com.E205.cocos_forest.domain.finance.card.UserCard;
import com.E205.cocos_forest.domain.finance.card.UserCardRepository;
import com.E205.cocos_forest.domain.finance.card.transaction.CardTransaction;
import com.E205.cocos_forest.domain.finance.card.transaction.CardTransactionRepository;
import com.E205.cocos_forest.domain.finance.category.Category;
import com.E205.cocos_forest.domain.finance.category.CategoryRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import com.E205.cocos_forest.domain.finance.merchant.Merchant;
import com.E205.cocos_forest.domain.finance.merchant.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardTransactionQueryServiceImpl implements CardTransactionQueryService {

    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final UserCardRepository userCardRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final CategoryRepository categoryRepository;
    private final EmissionFactorRepository emissionFactorRepository;
    private final MerchantRepository merchantRepository;

    private CardMonthlySummaryOut buildMonthlySummary(String userCardId, String yearMonth) {

        // 입력값 검증
        if (!StringUtils.hasText(userCardId) || !StringUtils.hasText(yearMonth)) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        // 조회 대상 연월 파싱 (yyyy-MM 형식)
        YearMonth targetMonth = parseYearMonth(yearMonth);

        // 카드 존재 여부 확인
        UserCard userCard = resolveUserCard(userCardId);

        // 조회 기간 계산 (해당 월의 1일 ~ 말일)
        LocalDate startDate = targetMonth.atDay(1);
        LocalDate endDate = targetMonth.atEndOfMonth();

        // 해당 카드 소유자의 해당 월 거래내역 조회
        List<CardTransaction> transactions = cardTransactionRepository.findByUserIdAndTxDateBetween(
            userCard.getUserId(), startDate, endDate);

        // 승인된 거래 내역만 필터링
        List<CardTransaction> approvedTransactions = transactions.stream()
            .filter(tx -> tx.getStatus() == CardTransaction.Status.APPROVED)
            .toList();

        // 사용된 카테고리와 배출계수 미리 로드
        Map<String, Category> categoryMap = loadCategories(approvedTransactions);
        Map<String, BigDecimal> factorMap = loadEmissionFactors(approvedTransactions);

        // 월별 요약 집계
        SummaryAccumulator totalAccumulator = new SummaryAccumulator();
        Map<LocalDate, SummaryAccumulator> dailyAccumulators = new HashMap<>();
        Map<String, SummaryAccumulator> categoryAccumulators = new HashMap<>();

        // 거래내역 순회하면서 집계
        for (CardTransaction tx : approvedTransactions) {
            long amount = tx.getAmountKrw();

            // 카테고리별 금액 x 배출계수로 배출량 계산
            BigDecimal factor = factorMap.getOrDefault(tx.getCategoryId(), BigDecimal.ZERO); // 배출계수
            BigDecimal carbon = factor.multiply(BigDecimal.valueOf(amount)); // 금액 x 배출계수 = 배출량

            // 전체 합계 누적
            totalAccumulator.add(amount, carbon);

            // 일자별 합계 누적
            dailyAccumulators
                .computeIfAbsent(tx.getTxDate(), ignored -> new SummaryAccumulator())
                .add(amount, carbon);

            // 카테고리별 합계 누적
            categoryAccumulators
                .computeIfAbsent(tx.getCategoryId(), ignored -> new SummaryAccumulator())
                .add(amount, carbon);
        }

        // 거래가 발생한 날 수
        long daysActive = dailyAccumulators.values().stream()
            .filter(acc -> acc.getTransactionCount() > 0)
            .count();

        // 일 평균 금액/탄소 배출량 계산
        long avgPerDayAmount = daysActive == 0
            ? 0
            : BigDecimal.valueOf(totalAccumulator.getAmountTotal())
                .divide(BigDecimal.valueOf(daysActive), 0, RoundingMode.HALF_UP)
                .longValue();

        BigDecimal avgPerDayCarbon = daysActive == 0
            ? BigDecimal.ZERO
            : scale(totalAccumulator.getCarbonTotal()
                .divide(BigDecimal.valueOf(daysActive), 2, RoundingMode.HALF_UP), 2);

        // 결과 생성
        CardMonthlySummaryOut.Totals totals = CardMonthlySummaryOut.Totals.builder()
            .amountTotal(totalAccumulator.getAmountTotal())
            .carbonTotalKg(scale(totalAccumulator.getCarbonTotal(), 2))
            .transactionCount(totalAccumulator.getTransactionCount())
            .daysActive(daysActive)
            .avgPerDayAmount(avgPerDayAmount)
            .avgPerDayCarbonKg(avgPerDayCarbon)
            .build();

        // 일별 요약 및 카테고리별 요약 생성
        List<CardMonthlySummaryOut.Daily> dailySummaries = buildDailySummaries(startDate, endDate, dailyAccumulators);
        List<CardMonthlySummaryOut.CategoryBreakdown> categorySummaries = buildCategorySummaries(
            categoryAccumulators, totalAccumulator, categoryMap);

        // 최종 응답 반환
        return CardMonthlySummaryOut.builder()
            .userCardId(userCardId)
            .yearMonth(targetMonth.format(YEAR_MONTH_FORMATTER))
            .totals(totals)
            .daily(dailySummaries)
            .byCategory(categorySummaries)
            .build();
    }

    @Override
    public CardMonthlySummaryOut getMonthlySummaryForUser(Long userId, String yearMonth) {
        String resolvedUserCardId = resolveUserCardIdForUser(userId);
        return buildMonthlySummary(resolvedUserCardId, yearMonth);
    }
    
    // 일별 상세 조회
    private CardDailyDetailsOut buildDailyDetails(String userCardId, String date) {

        long started = System.currentTimeMillis();

        if (!StringUtils.hasText(userCardId) || !StringUtils.hasText(date)) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        LocalDate targetDate;
        try {
            targetDate = LocalDate.parse(date);
        } catch (Exception ex) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "Invalid date format");
        }

        UserCard userCard = resolveUserCard(userCardId);

        List<CardTransaction> transactions = cardTransactionRepository.findByUserIdAndTxDate(
            userCard.getUserId(), targetDate);

        // 사용된 카테고리와 배출계수 미리 로드
        Map<String, Category> categoryMap = loadCategories(transactions);
        Map<String, BigDecimal> factorMap = loadEmissionFactors(transactions);
        Map<Long, com.E205.cocos_forest.domain.finance.merchant.Merchant> merchantMap = loadMerchants(transactions);

        // 거래 내역 목록 생성
        List<CardDailyDetailsOut.TransactionItem> items = transactions.stream()
            .map(tx -> {
                BigDecimal factor = factorMap.getOrDefault(tx.getCategoryId(), BigDecimal.ZERO);
                BigDecimal carbon = factor.multiply(BigDecimal.valueOf(tx.getAmountKrw()));

                String categoryName = Optional.ofNullable(categoryMap.get(tx.getCategoryId()))
                    .map(Category::getName)
                    .orElse(tx.getCategoryId());

                String approvedAt = null;
                if (tx.getTxDate() != null) {
                    // txDate + txTime 으로 ISO 8601 형식의 문자열 생성
                    var ldt = tx.getTxTime() == null
                        ? tx.getTxDate().atStartOfDay()
                        : tx.getTxDate().atTime(tx.getTxTime());
                    approvedAt = java.time.ZonedDateTime.of(ldt, java.time.ZoneId.of("Asia/Seoul"))
                        .toOffsetDateTime()
                        .toString();
                }

                // 거래내역 항목 생성
                return CardDailyDetailsOut.TransactionItem.builder()
                    .externalTransactionId(tx.getTransactionNo())
                    .approvedAt(approvedAt)
                    .txDate(tx.getTxDate() == null ? null : tx.getTxDate().toString())
                    .txTime(tx.getTxTime() == null ? null : tx.getTxTime().toString())
                    .amountKrw(tx.getAmountKrw())
                    .status(tx.getStatus() == null ? null : tx.getStatus().name())
                    .merchantName(Optional.ofNullable(tx.getMerchantId())
                        .map(merchantMap::get)
                        .map(Merchant::getName)
                        .orElse(null))
                    .categoryId(tx.getCategoryId())
                    .categoryName(categoryName)
                    .cardLast4(tx.getCardLast4())
                    .issuerCode(tx.getIssueCode())
                    .cardName(tx.getCardName())
                    .source("SSAFY")
                    .carbonKg(scale(carbon, 2))
                    .carbonCoefId(null)
                    .build();
            })
            .sorted(Comparator.comparing(CardDailyDetailsOut.TransactionItem::getApprovedAt,
                Comparator.nullsLast(String::compareTo)).reversed())
            .toList();

        // 승인된 상태만 조회
        List<CardDailyDetailsOut.TransactionItem> pendingItems = items.stream()
            .filter(i -> "APPROVED".equals(i.getStatus()))
            .toList();

        long amountTotal = pendingItems.stream().mapToLong(CardDailyDetailsOut.TransactionItem::getAmountKrw).sum();
        BigDecimal carbonTotal = pendingItems.stream()
            .map(CardDailyDetailsOut.TransactionItem::getCarbonKg)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        CardDailyDetailsOut.Totals totals = CardDailyDetailsOut.Totals.builder()
            .amountTotal(amountTotal)
            .carbonTotalKg(scale(carbonTotal, 2))
            .transactionCount(pendingItems.size())
            .build();

        long durationMs = System.currentTimeMillis() - started;

        // 메타 정보 생성
        CardDailyDetailsOut.Meta meta = CardDailyDetailsOut.Meta.builder()
            .lockAcquired(false)
            .durationMs(durationMs)
            .retry(0)
            .error(null)
            .build();

        return CardDailyDetailsOut.builder()
            .userCardId(userCardId)
            .date(targetDate.toString())
            .currency("KRW")
            .totals(totals)
            .transactions(items)
            .meta(meta)
            .build();
    }

    @Override
    public CardDailyDetailsOut getDailyDetailsForUser(Long userId, String date) {
        String userCardId = resolveUserCardIdForUser(userId);
        return buildDailyDetails(userCardId, date);
    }

    // yearMont 를 yyyy-MM 형식으로 파싱
    private YearMonth parseYearMonth(String yearMonth) {
        try {
            return YearMonth.parse(yearMonth, YEAR_MONTH_FORMATTER);
        } catch (DateTimeParseException ex) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "Invalid yearMonth format");
        }
    }

    // 카드 ID로 UserCard 조회
    private UserCard resolveUserCard(String userCardId) {
        return userCardRepository.findById(Long.valueOf(userCardId))
            .orElseThrow(() -> new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "Card not found"));
    }

    // 사용자가 가지고 있는 카드가 유효한지 검증 
    private String resolveUserCardIdForUser(Long userId) {
        if (userId == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "Missing userId");
        }

      StringUtils.hasText(null);

      return userCardRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
            .map(uc -> String.valueOf(uc.getUserCardId()))
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_CARD_NOT_LINKED));
    }

    // 거래에 등장한 categoryId 목록으로 카테고리 엔티티 로딩
    private Map<String, Category> loadCategories(List<CardTransaction> transactions) {
        Set<String> categoryIds = transactions.stream()
            .map(CardTransaction::getCategoryId)
            .collect(Collectors.toSet());

        if (categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return categoryRepository.findByCategoryIdIn(categoryIds).stream()
            .collect(Collectors.toMap(Category::getCategoryId, category -> category));
    }

    // 거래에 등장한 categoryId 목록으로 배출계수 로딩
    private Map<String, BigDecimal> loadEmissionFactors(List<CardTransaction> transactions) {
        Set<String> categoryIds = transactions.stream()
            .map(CardTransaction::getCategoryId)
            .collect(Collectors.toSet());

        if (categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return emissionFactorRepository.findByCategoryIdIn(categoryIds).stream()
            .collect(Collectors.toMap(EmissionFactor::getCategoryId, EmissionFactor::getFactor));
    }

    // 월의 모든 날짜를 돌면서 일별 요약 생성 (빈 날은 0 처리)
    private List<CardMonthlySummaryOut.Daily> buildDailySummaries(LocalDate startDate,
                                                                LocalDate endDate,
                                                                Map<LocalDate, SummaryAccumulator> dailyAccumulators) {
        List<CardMonthlySummaryOut.Daily> result = new ArrayList<>();

        for (LocalDate cursor = startDate; !cursor.isAfter(endDate); cursor = cursor.plusDays(1)) {
            SummaryAccumulator acc = dailyAccumulators.getOrDefault(cursor, SummaryAccumulator.empty());

            result.add(CardMonthlySummaryOut.Daily.builder()
                .date(cursor.toString())
                .amountTotal(acc.getAmountTotal())
                .carbonTotalKg(scale(acc.getCarbonTotal(), 2))
                .transactionCount(acc.getTransactionCount())
                .build());
        }

        return result;
    }

    // 카테고리별 요약 생성
    private List<CardMonthlySummaryOut.CategoryBreakdown> buildCategorySummaries(
        Map<String, SummaryAccumulator> categoryAccumulators,
        SummaryAccumulator totals,
        Map<String, Category> categoryMap) {

        BigDecimal amountTotal = BigDecimal.valueOf(Math.max(totals.getAmountTotal(), 0));
        BigDecimal carbonTotal = totals.getCarbonTotal();

        return categoryAccumulators.entrySet().stream()
            .map(entry -> {
                String categoryId = entry.getKey();
                SummaryAccumulator acc = entry.getValue();
                String categoryName = Optional.ofNullable(categoryMap.get(categoryId))
                    .map(Category::getName)
                    .orElse(categoryId);

                BigDecimal ratioAmount = amountTotal.signum() == 0
                    ? BigDecimal.ZERO
                    : scale(BigDecimal.valueOf(acc.getAmountTotal())
                        .divide(amountTotal, 3, RoundingMode.HALF_UP), 3);

                BigDecimal ratioCarbon = carbonTotal.signum() == 0
                    ? BigDecimal.ZERO
                    : scale(acc.getCarbonTotal().divide(carbonTotal, 3, RoundingMode.HALF_UP), 3);

                return CardMonthlySummaryOut.CategoryBreakdown.builder()
                    .categoryId(categoryId)
                    .categoryName(categoryName)
                    .amountTotal(acc.getAmountTotal())
                    .carbonTotalKg(scale(acc.getCarbonTotal(), 2))
                    .ratioAmount(ratioAmount)
                    .ratioCarbon(ratioCarbon)
                    .build();
            })
            .sorted(Comparator.comparing(CardMonthlySummaryOut.CategoryBreakdown::getAmountTotal).reversed())
            .toList();
    }

    // 카테고리별 조회
    private CardCategoryMonthlyDetailsOut buildMonthlyTransactionsByCategory(String userCardId, String yearMonth, String categoryId) {

        // 입력값 검증
        if (!StringUtils.hasText(userCardId) || !StringUtils.hasText(yearMonth) || !StringUtils.hasText(categoryId)) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE);
        }

        YearMonth targetMonth = parseYearMonth(yearMonth);

        UserCard userCard = resolveUserCard(userCardId);

        LocalDate startDate = targetMonth.atDay(1);
        LocalDate endDate = targetMonth.atEndOfMonth();

        // 해당 카드 소유자의 월 거래내역 조회
        List<CardTransaction> transactions = cardTransactionRepository.findByUserIdAndTxDateBetween(
            userCard.getUserId(), startDate, endDate);

        List<CardTransaction> approvedTransactions = transactions.stream()
            .filter(tx -> tx.getStatus() == CardTransaction.Status.APPROVED)
            .filter(tx -> categoryId.equals(tx.getCategoryId())) // categoryId 로 필터링
            .toList();

        Map<String, Category> categoryMap = loadCategories(approvedTransactions);
        Map<String, BigDecimal> factorMap = loadEmissionFactors(approvedTransactions);

        Map<Long, Merchant> merchantMap = loadMerchants(approvedTransactions);

        // Build transaction items for the month filtered by category
        List<CardDailyDetailsOut.TransactionItem> items = approvedTransactions.stream()
            .map(tx -> toTransactionItem(tx, categoryMap, factorMap, merchantMap))
            .sorted(Comparator.comparing(CardDailyDetailsOut.TransactionItem::getApprovedAt,
                Comparator.nullsLast(String::compareTo)).reversed())
            .toList();

        long amountTotal = items.stream().mapToLong(CardDailyDetailsOut.TransactionItem::getAmountKrw).sum();
        BigDecimal carbonTotal = items.stream()
            .map(CardDailyDetailsOut.TransactionItem::getCarbonKg)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        String categoryName = Optional.ofNullable(categoryMap.get(categoryId))
            .map(Category::getName)
            .orElse(categoryId);

        CardCategoryMonthlyDetailsOut.Totals totals = CardCategoryMonthlyDetailsOut.Totals.builder()
            .amountTotal(amountTotal)
            .carbonTotalKg(scale(carbonTotal, 2))
            .transactionCount(items.size())
            .build();

        return CardCategoryMonthlyDetailsOut.builder()
            .userCardId(userCardId)
            .yearMonth(targetMonth.format(YEAR_MONTH_FORMATTER))
            .categoryId(categoryId)
            .categoryName(categoryName)
            .totals(totals)
            .transactions(items)
            .build();
    }

    @Override
    public CardCategoryMonthlyDetailsOut getMonthlyTransactionsByCategoryForUser(Long userId, String yearMonth, String categoryId) {
        String resolvedUserCardId = resolveUserCardIdForUser(userId);
        return buildMonthlyTransactionsByCategory(resolvedUserCardId, yearMonth, categoryId);
    }

    private static BigDecimal scale(BigDecimal value, int scale) {
        return value.setScale(scale, RoundingMode.HALF_UP);
    }

    // 소비내역 and 탄소배출량 월별 집계용 클래스
    private static class SummaryAccumulator {
        private long amountTotal;
        private long transactionCount;
        private BigDecimal carbonTotal = BigDecimal.ZERO;

        static SummaryAccumulator empty() {
            return new SummaryAccumulator();
        }

        void add(long amount, BigDecimal carbon) {
            this.amountTotal += amount;
            this.transactionCount += 1;
            this.carbonTotal = this.carbonTotal.add(carbon);
        }

        long getAmountTotal() {
            return amountTotal;
        }

        long getTransactionCount() {
            return transactionCount;
        }

        BigDecimal getCarbonTotal() {
            return carbonTotal;
        }
    }

    // 거래 내역 정보를 TransacitonItem 으로 매핑
    private CardDailyDetailsOut.TransactionItem toTransactionItem(
        CardTransaction tx,
        Map<String, Category> categoryMap,
        Map<String, BigDecimal> factorMap,
        Map<Long, Merchant> merchantMap
    ) {
        BigDecimal factor = factorMap.getOrDefault(tx.getCategoryId(), BigDecimal.ZERO);
        BigDecimal carbon = factor.multiply(BigDecimal.valueOf(tx.getAmountKrw()));

        String categoryName = Optional.ofNullable(categoryMap.get(tx.getCategoryId()))
            .map(Category::getName)
            .orElse(tx.getCategoryId());

        String approvedAt = null;
        if (tx.getTxDate() != null) {
            var ldt = tx.getTxTime() == null
                ? tx.getTxDate().atStartOfDay()
                : tx.getTxDate().atTime(tx.getTxTime());
            approvedAt = java.time.ZonedDateTime.of(ldt, java.time.ZoneId.of("Asia/Seoul"))
                .toOffsetDateTime()
                .toString();
        }

        // 가맹점 Id로 이름을 가져오기
        String merchantName = Optional.ofNullable(tx.getMerchantId()) //nullable 하기 때문에 Optional 형식으로 받음
            .map(merchantMap::get) //객체의 메서드 참조
            .map(Merchant::getName) // 클래스의 메서드 참조
            .orElse(null);

        return CardDailyDetailsOut.TransactionItem.builder()
            .externalTransactionId(tx.getTransactionNo())
            .approvedAt(approvedAt)
            .txDate(tx.getTxDate() == null ? null : tx.getTxDate().toString())
            .txTime(tx.getTxTime() == null ? null : tx.getTxTime().toString())
            .amountKrw(tx.getAmountKrw())
            .status(tx.getStatus() == null ? null : tx.getStatus().name())
            .merchantName(merchantName)
            .categoryId(tx.getCategoryId())
            .categoryName(categoryName)
            .cardLast4(tx.getCardLast4())
            .issuerCode(tx.getIssueCode())
            .cardName(tx.getCardName())
            .source("SSAFY")
            .carbonKg(scale(carbon, 2))
            .carbonCoefId(null)
            .build();
    }

    // 거래에서 등장한 merchantId로 가맹점 정보를 미리 로딩합니다.
    private Map<Long, Merchant> loadMerchants(List<CardTransaction> transactions) {
        Set<Long> ids = transactions.stream()
            .map(CardTransaction::getMerchantId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        if (ids.isEmpty()) return Collections.emptyMap();
        return merchantRepository.findByIdIn(ids).stream()
            .collect(Collectors.toMap(Merchant::getId, m -> m));
    }
}
