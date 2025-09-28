package com.E205.cocos_forest.api.challenge.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeTodayOut {
    private String date;              // yyyy-MM-dd (KST)
    private boolean fresh;            // true if calculated now
    private String lastSyncedAt;      // ISO string with +09:00
    private List<Item> challenges;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        private String instanceId;         // UC-YYYYMMDD-<code>-<id>
        private String challengeId;        // CH-<code>
        private String title;
        private String rule;
        private int rewardPoints;
        private String status;             // PENDING | SUCCESS | FAIL
        private boolean claimable;         // true if user can claim now
        private Map<String, Object> metrics; // nested maps as needed
        private boolean awarded;
        private String awardedAt;          // ISO string or null
        private String message;            // short message
    }
}

