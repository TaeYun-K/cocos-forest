package com.E205.cocos_forest.api.challenge.service.challenge;

import com.E205.cocos_forest.api.challenge.dto.out.ChallengeTodayOut;
import com.E205.cocos_forest.api.forest.service.PointService;
import com.E205.cocos_forest.domain.challenge.entity.Challenge;
import com.E205.cocos_forest.domain.challenge.entity.UserChallenge;
import com.E205.cocos_forest.domain.challenge.repository.ChallengeRepository;
import com.E205.cocos_forest.domain.challenge.repository.UserChallengeRepository;
import com.E205.cocos_forest.domain.finance.card.transaction.CardTransaction;
import com.E205.cocos_forest.domain.finance.card.transaction.CardTransactionRepository;
import com.E205.cocos_forest.domain.finance.merchant.Merchant;
import com.E205.cocos_forest.domain.finance.merchant.MerchantRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.E205.cocos_forest.domain.health.repository.DailyStepsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ChallengeServiceImpl implements ChallengeService {

    private static final ZoneId ZONE_KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter COMPACT_DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ChallengeRepository challengeRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final PointService pointService;
    private final MerchantRepository merchantRepository;
    private final DailyStepsRepository dailyStepsRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();



    /**
     * 하루 단위 챌린지 평가/보상/조회 서비스
     * 
     * - 활성 챌린지 조회
     * - 해당 날짜(User, Challenge, Date)별 UserChallenge 레코드 보장
     * - 지표 평가(금액/배출량 등) 달성 및 판단
     * - 자동 보상 포인트 지급
     * - DTO 구성
     */
    @Override
    @Transactional //평가, 보상, 저장까지 한 트랜잭션에서 처리
    public ChallengeTodayOut getTodayChallenges(Long userId) {
        LocalDate today = LocalDate.now(ZONE_KST);
        OffsetDateTime now = OffsetDateTime.now(ZONE_KST); //동기화 시간 표시용

        List<Challenge> active = challengeRepository.findByIsActiveTrue(); //활성화된 챌린지 전체

        List<ChallengeTodayOut.Item> items = new ArrayList<>();

        // 활성화 된 챌린지 대상으로 처리
        for (Challenge ch : active) {
            // 금일의 UserChallenge 레코드를 확보(없으면 PENDING 생성)
            UserChallenge uc = userChallengeRepository
                .findByUserIdAndChallengeIdAndChallengeDate(userId, ch.getId(), today)
                .orElseGet(() -> createPending(userId, ch, today));

            // 챌린지 달성 여부 계산 후 상태 갱신
            Evaluation eval;
            if (ch.getMetricType() == null || ch.getComparator() == null) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("warning", "challenge_misconfigured");
                eval = new Evaluation(false, m);
            } else {
                if (ch.getMetricType() == Challenge.MetricType.ATTENDANCE) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("attended", true);
                    eval = new Evaluation(true, m);
                } else if (ch.getMetricType() == Challenge.MetricType.STEPS) {
                    Map<String, Object> m = new LinkedHashMap<>();
                    BigDecimal val = evaluateSteps(userId, ch, today, m);
                    BigDecimal threshold = ch.getThresholdValue() == null ? BigDecimal.ZERO : ch.getThresholdValue();
                    boolean achieved = (ch.getComparator() == Challenge.ComparatorType.LTE)
                        ? (val.compareTo(threshold) <= 0)
                        : (val.compareTo(threshold) >= 0);
                    eval = new Evaluation(achieved, m);
                } else {
                    eval = evaluate(userId, ch, today);
                }
                applyEvaluation(uc, ch, eval);
            }

            // 클라이언트 응답용 아이템 구성
            items.add(toItem(uc, ch, eval, now));
        }

        return ChallengeTodayOut.builder()
            .date(today.format(DATE_FMT))
            .fresh(true)
            .lastSyncedAt(now.toString())
            .challenges(items)
            .build();
    }

    /**
     * 금일 PENDING 상태의 UserChallenge 생성 후 저장
     * - 최초 조회 시 오늘 항목이 없다면 호출됨
     */
    private UserChallenge createPending(Long userId, Challenge ch, LocalDate date) {
        UserChallenge uc = new UserChallenge();
        uc.setUserId(userId);
        uc.setChallengeId(ch.getId());
        uc.setChallengeDate(date);
        uc.setStatus(UserChallenge.Status.PENDING);
        uc.setRewardPoints(0);
        return userChallengeRepository.save(uc);
    }

    private record Evaluation(boolean achieved, Map<String, Object> metrics) {}

    /**
     * 챌린지의 Metric, Comparator, Threshold 조건을 바탕으로 금일 지표를 평가
     * Amount : 카드 승인 거래 합계
     * Emission : 배출량 집계 연동 예정
     * Attendence, Steps: 추후 구현 예정
     *
     * - threshold 가 0일 때의 특수 처리 포함
     */
    private Evaluation evaluate(Long userId, Challenge ch, LocalDate date) {
        Map<String, Object> metrics = new LinkedHashMap<>();

        BigDecimal value = switch (ch.getMetricType()) {
            case AMOUNT -> evaluateAmount(userId, ch, date, metrics);
            case EMISSION -> evaluateEmission(userId, ch, date, metrics);
            case ATTENDANCE, STEPS -> BigDecimal.ZERO; // 추후 추가 예정
            default -> BigDecimal.ZERO;
        };

        BigDecimal threshold = ch.getThresholdValue() == null ? BigDecimal.ZERO : ch.getThresholdValue();
        boolean achieved;

        if (ch.getComparator() == Challenge.ComparatorType.LTE) {
            achieved = value.compareTo(threshold) <= 0;
        } else { // GTE
            achieved = value.compareTo(threshold) >= 0;
        }

        return new Evaluation(achieved, metrics);
    }


    /**
     * 평가 결과를 UserChallenge에 반영하고, 자동 보상이면 포인트 지급 시도.
     * - 최초 달성 시 DONE, achievedAt 기록
     */
    private void applyEvaluation(UserChallenge uc, Challenge ch, Evaluation eval) {
        if (eval.achieved() && uc.getStatus() != UserChallenge.Status.DONE) {
            uc.setStatus(UserChallenge.Status.DONE);
            uc.setAchievedAt(LocalDateTime.now(ZONE_KST));
        }

        // persist changes
        userChallengeRepository.save(uc);
    }

    /**
     * 단일 챌린지 항목을 응답 DTO로 변환
     */
    private ChallengeTodayOut.Item toItem(UserChallenge uc, Challenge ch, Evaluation eval, OffsetDateTime now) {
        String code = deriveCode(ch);
        String instanceId = String.format("UC-%s-%s-%d", uc.getChallengeDate().format(COMPACT_DATE_FMT), code, uc.getId());
        String challengeId = String.format("CH-%s", code);

        boolean awarded = uc.getRewardPoints() != null && uc.getRewardPoints() > 0;
        String awardedAt = awarded && uc.getAchievedAt() != null
            ? uc.getAchievedAt().atZone(ZONE_KST).toOffsetDateTime().toString()
            : null;

        String statusStr = switch (uc.getStatus()) {
            case DONE -> "SUCCESS";
            case FAIL -> "FAIL";
            default -> "PENDING";
        };

        String rule = buildRule(ch);
        String message = buildMessage(ch, eval, statusStr);

        boolean claimable = (uc.getStatus() == UserChallenge.Status.DONE) && !awarded;

        return ChallengeTodayOut.Item.builder()
            .instanceId(instanceId)
            .challengeId(challengeId)
            .title(ch.getTitle())
            .rule(rule)
            .rewardPoints(ch.getRewardPoints())
            .status(statusStr)
            .claimable(claimable)
            .metrics(eval.metrics())
            .awarded(awarded)
            .awardedAt(awardedAt)
            .message(message)
            .build();
    }

    /**
     * 챌린지 코드 생성
     */
    private String deriveCode(Challenge ch) {
        // Prefer categoryId as a stable code if present; otherwise sanitize title
        String base = Optional.ofNullable(ch.getCategoryId()).filter(s -> !s.isBlank()).orElse(ch.getTitle());
        return base.toUpperCase().replaceAll("[^A-Z0-9]+", "-");
    }

    /**
     * 규칙 문구 생성
     */
    private String buildRule(Challenge ch) {
        // Fallback: build from comparator + threshold
        String comp = ch.getComparator() == Challenge.ComparatorType.LTE ? "≤" : "≥";
        String unit = ch.getMetricType() == Challenge.MetricType.AMOUNT ? "원" : "";
        return String.format("목표: %s %s %s%s", ch.getMetricType(), comp, ch.getThresholdValue().stripTrailingZeros().toPlainString(), unit);
    }

    /**
     * 유저에게 보여줄 메시지를 생성
     */
    private String buildMessage(Challenge ch, Evaluation eval, String statusStr) {
        if ("SUCCESS".equals(statusStr)) {
            return "오늘 목표 달성!";
        }
        // simple guidance message from progress
        if (ch.getComparator() == Challenge.ComparatorType.LTE && ch.getMetricType() == Challenge.MetricType.AMOUNT) {
            try {
                BigDecimal threshold = ch.getThresholdValue() == null ? BigDecimal.ZERO : ch.getThresholdValue();

                @SuppressWarnings("unchecked")
                Map<String, Object> amount =
                        (Map<String, Object>) eval.metrics().getOrDefault("amount", Map.<String, Object>of("krw", 0L));

                Object krwObj = amount.getOrDefault("krw", 0L);
                long spent = (krwObj instanceof Number n)
                        ? n.longValue()
                        : new BigDecimal(String.valueOf(krwObj)).longValue();

                BigDecimal remain = threshold.subtract(BigDecimal.valueOf(spent));
                if (remain.compareTo(BigDecimal.ZERO) > 0) {
                    return String.format("조금만 더! %,d원 남았어요", remain.longValue());
                }
            } catch (Exception ignored) {}
        }
        return "목표에 도전해보세요";
    }

    /**
     * 금일 승인된 카드 거래 중, 포함/제외 카테고리 필터를 적용해 합계(원) 계산
     */
    private BigDecimal evaluateAmount(Long userId, Challenge ch, LocalDate date, Map<String, Object> metricsOut) {
        List<CardTransaction> txs = cardTransactionRepository.findByUserIdAndTxDate(userId, date);
        List<CardTransaction> approved = txs.stream()
            .filter(t -> t.getStatus() == CardTransaction.Status.APPROVED)
            .toList();

        Set<String> includeCategories = parseStringSet(ch.getExtraConditions(), "includeCategories");
        Set<String> excludeCategories = parseStringSet(ch.getExtraConditions(), "excludeCategories");

        // Merchant name filters (supports keys: include_merchants, merchant_whitelist, exclude_merchants)
        Set<String> includeMerchants = new HashSet<>();
        includeMerchants.addAll(parseStringSet(ch.getExtraConditions(), "include_merchants"));
        includeMerchants.addAll(parseStringSet(ch.getExtraConditions(), "merchant_whitelist"));
        Set<String> excludeMerchants = parseStringSet(ch.getExtraConditions(), "exclude_merchants");

        Map<Long, String> merchantNameById;
        if (!includeMerchants.isEmpty() || !excludeMerchants.isEmpty()) {
            Set<Long> ids = approved.stream()
                .map(CardTransaction::getMerchantId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
            if (!ids.isEmpty()) {
                merchantNameById = merchantRepository.findByIdIn(ids).stream()
                    .collect(Collectors.toMap(Merchant::getId, Merchant::getName));
            } else {
              merchantNameById = Collections.emptyMap();
            }
        } else {
          merchantNameById = Collections.emptyMap();
        }

      long amount = approved.stream()
            .filter(t -> includeCategories.isEmpty() || includeCategories.contains(t.getCategoryId()))
            .filter(t -> excludeCategories.isEmpty() || !excludeCategories.contains(t.getCategoryId()))
            .filter(t -> {
                if (includeMerchants.isEmpty() && excludeMerchants.isEmpty()) return true;
                String name = merchantNameById.getOrDefault(t.getMerchantId(), null);
                if (name == null) return false;
                if (!includeMerchants.isEmpty() && !includeMerchants.contains(name)) return false;
                return excludeMerchants.isEmpty() || !excludeMerchants.contains(name);
            })
            .mapToLong(CardTransaction::getAmountKrw)
            .sum();

        Map<String, Object> amountMap = new LinkedHashMap<>();
        amountMap.put("krw", amount);
        metricsOut.put("amount", amountMap);

        return BigDecimal.valueOf(amount);
    }


    /**
     * 포인트 수동 지급
     * userChallenges 에 status 가 Done 인데 rewardPoints 가 0이라면 포인트 지급
     */
    @Transactional
    public void claimReward(Long userId, Long userChallengeId) {
        UserChallenge uc = userChallengeRepository.findById(userChallengeId)
            .orElseThrow(() -> new IllegalArgumentException("UserChallenge not found"));
        if (!Objects.equals(uc.getUserId(), userId)) {
            throw new IllegalStateException("Forbidden: not your challenge");
        }
        if (uc.getStatus() != UserChallenge.Status.DONE) {
            throw new IllegalStateException("Challenge not achieved yet");
        }
        if (uc.getRewardPoints() != null && uc.getRewardPoints() > 0) {
            // already claimed
            return;
        }
        Challenge ch = challengeRepository.findById(uc.getChallengeId())
            .orElseThrow(() -> new IllegalStateException("Challenge not found"));

        pointService.earnPoints(userId, ch.getRewardPoints(), "CHALLENGE_REWARD", uc.getId(), ch.getTitle());
        uc.setRewardPoints(ch.getRewardPoints());
        userChallengeRepository.save(uc);
    }

    /**
     * 걸음수 기반 챌린지 평가 및 보상 처리
     * - 활성화된 STEPS 챌린지를 가져와 오늘의 걸음수(DailySteps)와 비교하여 완료/보상 처리
     */
    @Transactional
    public void evaluateStepsChallenge(Long userId) {
        LocalDate today = LocalDate.now(ZONE_KST);

        int steps = dailyStepsRepository.findByUserIdAndTargetDate(userId, today)
            .map(ds -> ds.getSteps() == null ? 0 : ds.getSteps())
            .orElse(0);

        // challenge_id=5만 평가
        Challenge ch = challengeRepository.findById(5L).orElse(null);
        if (ch == null) return;
        if (ch.getMetricType() != Challenge.MetricType.STEPS || !Boolean.TRUE.equals(ch.getIsActive())) return;

        BigDecimal value = BigDecimal.valueOf(steps);
        BigDecimal threshold = ch.getThresholdValue() == null ? BigDecimal.ZERO : ch.getThresholdValue();
        boolean achieved = (ch.getComparator() == Challenge.ComparatorType.LTE)
            ? (value.compareTo(threshold) <= 0)
            : (value.compareTo(threshold) >= 0);

        if (!achieved) return;

        UserChallenge uc = userChallengeRepository
            .findByUserIdAndChallengeIdAndChallengeDate(userId, ch.getId(), today)
            .orElseGet(() -> createPending(userId, ch, today));

        boolean dirty = false;
        if (uc.getStatus() != UserChallenge.Status.DONE) {
            uc.setStatus(UserChallenge.Status.DONE);
            uc.setAchievedAt(LocalDateTime.now(ZONE_KST));
            dirty = true;
        }

        if (dirty) userChallengeRepository.save(uc);
    }


    /**
     * 금일 탄소 배출량 평가
     * - 추후 DailyEmission 등 집계 테이블과 연동 예정
     */
    private BigDecimal evaluateEmission(Long userId, Challenge ch, LocalDate date, Map<String, Object> metricsOut) {
        // TODO: integrate with DailyEmission when available; placeholder 0
        Map<String, Object> carbon = new LinkedHashMap<>();
        carbon.put("kg", BigDecimal.ZERO);
        metricsOut.put("carbon", carbon);
        return BigDecimal.ZERO;
    }

    /**
     * 금일 걸음수 평가: DailySteps에 저장된 걸음수를 metrics에 담고 비교값으로 반환
     */
    private BigDecimal evaluateSteps(Long userId, Challenge ch, LocalDate date, Map<String, Object> metricsOut) {
        int steps = dailyStepsRepository.findByUserIdAndTargetDate(userId, date)
            .map(ds -> ds.getSteps() == null ? 0 : ds.getSteps())
            .orElse(0);
        metricsOut.put("steps", steps);
        return BigDecimal.valueOf(steps);
    }

    /**
     * JSON 문자열에서 특정 key의 배열 값을 Set<String>으로 파싱
     */
    private Set<String> parseStringSet(String json, String key) {
        try {
            if (json == null || json.isBlank()) return Collections.emptySet();
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<>() {});
            Object v = map.get(key);
            if (v instanceof Collection<?> c) {
                return c.stream().filter(Objects::nonNull).map(Object::toString).collect(Collectors.toSet());
            }
            return Collections.emptySet();
        } catch (Exception e) {
            log.warn("Invalid extra_conditions JSON: {}", e.getMessage());
            return Collections.emptySet();
        }
    }
}

