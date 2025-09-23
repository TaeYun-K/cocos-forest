package com.E205.cocos_forest.api.challenge.service.tumbler;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ReceiptTextParser {

    private static final DateTimeFormatter[] DATE_FORMATS = new DateTimeFormatter[]{
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("yyyy.MM.dd"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd"),
        DateTimeFormatter.ofPattern("yy.MM.dd"),
        DateTimeFormatter.ofPattern("yy/MM/dd"),
        DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"),
        DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm")
    };

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("\\b(\\d{1,3}(,\\d{3})+|\\d{4,})\\s*(원)?\\b");
    private static final Pattern BIZNO_PATTERN = Pattern.compile("\\b\\d{3}-\\d{2}-\\d{5}\\b");

    private static final String[] RECEIPT_MARKERS = new String[]{
        "영수증", "매출전표", "고객용", "가맹점", "사업자", "승인", "승인번호", "카드", "금액", "부가세"
    };

    public Optional<LocalDate> extractReceiptDate(String text, ZoneId zone) {
        if (text == null || text.isBlank()) return Optional.empty();
        String t = text.replaceAll("\\s+", " ").trim();

        // 빠른 후보: 거래/승인/일시 주변
        List<String> candidates = new ArrayList<>();
        for (String key : new String[]{"거래일시", "승인일시", "일시", "날짜"}) {
            int idx = t.indexOf(key);
            if (idx >= 0) {
                int start = Math.max(0, idx);
                int end = Math.min(t.length(), idx + 40);
                candidates.add(t.substring(start, end));
            }
        }
        candidates.add(t); // 전체 텍스트도 후보로

        for (String s : candidates) {
            Optional<LocalDate> d = parseFirstDate(s, zone);
            if (d.isPresent()) return d;
        }
        return Optional.empty();
    }

    private Optional<LocalDate> parseFirstDate(String s, ZoneId zone) {
        // 숫자 블록을 찾아 포맷 시도
        // 간단히 공백/특수문자 단위로 토큰화 후 포맷 적용
        String[] tokens = s.split("[\\n\\r\\t ]+");
        for (String tok : tokens) {
            for (DateTimeFormatter f : DATE_FORMATS) {
                try {
                    if (f.toString().contains("HH")) {
                        LocalDateTime dt = LocalDateTime.parse(tok, f);
                        return Optional.of(dt.toLocalDate());
                    } else {
                        LocalDate d = LocalDate.parse(tok, f);
                        // 2자리 연도 보정: 20xx 가정
                        if (f.toString().contains("yy") && d.getYear() < 100) {
                            d = d.withYear(2000 + d.getYear());
                        }
                        return Optional.of(d);
                    }
                } catch (DateTimeParseException ignored) {}
            }
            // 한국식 yyyy년MM월dd일 형태에서 공백 없는 경우 처리
            try {
                if (tok.contains("년") && tok.contains("월") && tok.contains("일")) {
                    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy년MM월dd일", Locale.KOREA);
                    LocalDate d = LocalDate.parse(tok, fmt);
                    return Optional.of(d);
                }
            } catch (Exception ignored) {}
        }
        return Optional.empty();
    }

    public boolean looksLikeReceipt(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase(Locale.ROOT);
        int markers = 0;
        for (String m : RECEIPT_MARKERS) {
            if (lower.contains(m.toLowerCase(Locale.ROOT))) markers++;
        }
        boolean hasAmount = AMOUNT_PATTERN.matcher(lower).find();
        boolean hasBizNo = BIZNO_PATTERN.matcher(lower).find();
        // 사업자등록번호가 있으면 강한 신호. 없으면 마커 2개 + 금액 패턴 요구
        return hasBizNo || (markers >= 2 && hasAmount);
    }
}
