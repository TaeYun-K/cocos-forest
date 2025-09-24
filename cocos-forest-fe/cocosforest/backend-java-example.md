# 챌린지 시스템 백엔드 Java 구현 예시

## 1. Entity 클래스

### Challenge.java
```java
@Entity
@Table(name = "challenge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "challenge_type", nullable = false)
    private ChallengeType challengeType;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "icon")
    private String icon;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false)
    private Difficulty difficulty;
    
    @Column(name = "points", nullable = false)
    private Integer points;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChallengeStatus status;
    
    @Column(name = "progress", nullable = false)
    private Integer progress = 0;
    
    @Column(name = "max_progress", nullable = false)
    private Integer maxProgress;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "reward_claimed", nullable = false)
    private Boolean rewardClaimed = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

enum ChallengeType {
    ATTENDANCE, STEPS, TRANSPORT, TUMBLER
}

enum Difficulty {
    EASY, MEDIUM, HARD
}

enum ChallengeStatus {
    PENDING, IN_PROGRESS, COMPLETED, FAILED
}
```

### UserPoints.java
```java
@Entity
@Table(name = "user_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPoints {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;
    
    @Column(name = "earned_points", nullable = false)
    private Integer earnedPoints = 0;
    
    @Column(name = "used_points", nullable = false)
    private Integer usedPoints = 0;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
```

## 2. Repository 클래스

### ChallengeRepository.java
```java
@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByUserId(Long userId);
    
    Optional<Challenge> findByUserIdAndChallengeType(Long userId, ChallengeType challengeType);
    
    @Query("SELECT c FROM Challenge c WHERE c.userId = :userId AND c.status = 'COMPLETED'")
    List<Challenge> findCompletedChallengesByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE Challenge c SET c.status = 'PENDING', c.progress = 0, c.completedAt = null, c.rewardClaimed = false WHERE c.userId = :userId AND c.challengeType IN ('ATTENDANCE', 'STEPS', 'TRANSPORT', 'TUMBLER')")
    void resetDailyChallenges(@Param("userId") Long userId);
}
```

## 3. Service 클래스

### ChallengeService.java
```java
@Service
@Transactional
@RequiredArgsConstructor
public class ChallengeService {
    
    private final ChallengeRepository challengeRepository;
    private final UserPointsRepository userPointsRepository;
    private final UserRepository userRepository;
    
    public ChallengeStatusResponse getChallengeStatus(Long userId) {
        List<Challenge> challenges = challengeRepository.findByUserId(userId);
        
        // 초기 챌린지가 없으면 생성
        if (challenges.isEmpty()) {
            initializeChallenges(userId);
            challenges = challengeRepository.findByUserId(userId);
        }
        
        int totalPoints = challenges.stream()
            .mapToInt(Challenge::getPoints)
            .sum();
            
        long completedCount = challenges.stream()
            .filter(c -> c.getStatus() == ChallengeStatus.COMPLETED)
            .count();
        
        return ChallengeStatusResponse.builder()
            .challenges(challenges.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList()))
            .totalPoints(totalPoints)
            .completedChallenges((int) completedCount)
            .build();
    }
    
    public ChallengeProgressResponse checkAttendance(Long userId) {
        Challenge challenge = getOrCreateChallenge(userId, ChallengeType.ATTENDANCE);
        
        if (challenge.getStatus() == ChallengeStatus.COMPLETED) {
            throw new BaseException(BaseResponseStatus.ALREADY_COMPLETED_CHALLENGE);
        }
        
        // 오늘 이미 출석체크했는지 확인
        if (isTodayAttendanceCompleted(userId)) {
            throw new BaseException(BaseResponseStatus.ALREADY_ATTENDANCE_TODAY);
        }
        
        challenge.setProgress(1);
        challenge.setStatus(ChallengeStatus.COMPLETED);
        challenge.setCompletedAt(LocalDateTime.now());
        
        challengeRepository.save(challenge);
        
        // 포인트 지급
        addPoints(userId, challenge.getPoints());
        
        return ChallengeProgressResponse.builder()
            .success(true)
            .challengeId(challenge.getId().toString())
            .challengeType(challenge.getChallengeType().name().toLowerCase())
            .progress(challenge.getProgress())
            .maxProgress(challenge.getMaxProgress())
            .isCompleted(true)
            .pointsEarned(challenge.getPoints())
            .message("출석체크가 완료되었습니다.")
            .build();
    }
    
    public ChallengeProgressResponse updateSteps(Long userId, Integer steps) {
        Challenge challenge = getOrCreateChallenge(userId, ChallengeType.STEPS);
        
        challenge.setProgress(Math.min(steps, challenge.getMaxProgress()));
        
        boolean isCompleted = challenge.getProgress() >= challenge.getMaxProgress();
        if (isCompleted && challenge.getStatus() != ChallengeStatus.COMPLETED) {
            challenge.setStatus(ChallengeStatus.COMPLETED);
            challenge.setCompletedAt(LocalDateTime.now());
            addPoints(userId, challenge.getPoints());
        } else if (!isCompleted) {
            challenge.setStatus(ChallengeStatus.IN_PROGRESS);
        }
        
        challengeRepository.save(challenge);
        
        return ChallengeProgressResponse.builder()
            .success(true)
            .challengeId(challenge.getId().toString())
            .challengeType(challenge.getChallengeType().name().toLowerCase())
            .progress(challenge.getProgress())
            .maxProgress(challenge.getMaxProgress())
            .isCompleted(isCompleted)
            .pointsEarned(isCompleted ? challenge.getPoints() : 0)
            .message("걸음수가 업데이트되었습니다.")
            .build();
    }
    
    public ChallengeProgressResponse checkTransport(Long userId) {
        Challenge challenge = getOrCreateChallenge(userId, ChallengeType.TRANSPORT);
        
        if (challenge.getStatus() == ChallengeStatus.COMPLETED) {
            throw new BaseException(BaseResponseStatus.ALREADY_COMPLETED_CHALLENGE);
        }
        
        // 소비내역 API에서 대중교통 이용 확인
        boolean hasUsedTransport = checkTransportUsageFromFinanceAPI(userId);
        
        if (hasUsedTransport) {
            challenge.setProgress(1);
            challenge.setStatus(ChallengeStatus.COMPLETED);
            challenge.setCompletedAt(LocalDateTime.now());
            challengeRepository.save(challenge);
            addPoints(userId, challenge.getPoints());
        }
        
        return ChallengeProgressResponse.builder()
            .success(true)
            .challengeId(challenge.getId().toString())
            .challengeType(challenge.getChallengeType().name().toLowerCase())
            .progress(challenge.getProgress())
            .maxProgress(challenge.getMaxProgress())
            .isCompleted(hasUsedTransport)
            .pointsEarned(hasUsedTransport ? challenge.getPoints() : 0)
            .message(hasUsedTransport ? "대중교통 이용이 확인되었습니다." : "대중교통 이용이 확인되지 않았습니다.")
            .build();
    }
    
    public ChallengeProgressResponse verifyTumbler(Long userId, String imageData) {
        Challenge challenge = getOrCreateChallenge(userId, ChallengeType.TUMBLER);
        
        if (challenge.getStatus() == ChallengeStatus.COMPLETED) {
            throw new BaseException(BaseResponseStatus.ALREADY_COMPLETED_CHALLENGE);
        }
        
        // OCR 처리 및 텀블러 인증
        boolean isTumblerVerified = processTumblerVerification(imageData);
        
        if (isTumblerVerified) {
            challenge.setProgress(1);
            challenge.setStatus(ChallengeStatus.COMPLETED);
            challenge.setCompletedAt(LocalDateTime.now());
            challengeRepository.save(challenge);
            addPoints(userId, challenge.getPoints());
        }
        
        return ChallengeProgressResponse.builder()
            .success(true)
            .challengeId(challenge.getId().toString())
            .challengeType(challenge.getChallengeType().name().toLowerCase())
            .progress(challenge.getProgress())
            .maxProgress(challenge.getMaxProgress())
            .isCompleted(isTumblerVerified)
            .pointsEarned(isTumblerVerified ? challenge.getPoints() : 0)
            .message(isTumblerVerified ? "텀블러 인증이 완료되었습니다." : "텀블러 인증에 실패했습니다.")
            .build();
    }
    
    public RewardClaimResponse claimReward(Long userId, String challengeId, String challengeType) {
        Challenge challenge = challengeRepository.findById(Long.parseLong(challengeId))
            .orElseThrow(() -> new BaseException(BaseResponseStatus.CHALLENGE_NOT_FOUND));
        
        if (!challenge.getUserId().equals(userId)) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_CHALLENGE);
        }
        
        if (challenge.getStatus() != ChallengeStatus.COMPLETED) {
            throw new BaseException(BaseResponseStatus.CHALLENGE_NOT_COMPLETED);
        }
        
        if (challenge.getRewardClaimed()) {
            throw new BaseException(BaseResponseStatus.ALREADY_CLAIMED_REWARD);
        }
        
        challenge.setRewardClaimed(true);
        challengeRepository.save(challenge);
        
        UserPoints userPoints = getUserPoints(userId);
        userPoints.setTotalPoints(userPoints.getTotalPoints() + challenge.getPoints());
        userPointsRepository.save(userPoints);
        
        return RewardClaimResponse.builder()
            .success(true)
            .pointsEarned(challenge.getPoints())
            .totalPoints(userPoints.getTotalPoints())
            .message("보상이 수령되었습니다.")
            .build();
    }
    
    @Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시
    public void resetDailyChallenges() {
        List<Long> allUserIds = userRepository.findAllUserIds();
        for (Long userId : allUserIds) {
            challengeRepository.resetDailyChallenges(userId);
        }
    }
    
    private void initializeChallenges(Long userId) {
        List<Challenge> challenges = Arrays.asList(
            createChallenge(userId, ChallengeType.ATTENDANCE, "출석체크", "매일 앱에 접속하여 출석체크를 완료하세요", "📅", Difficulty.EASY, 100, 1),
            createChallenge(userId, ChallengeType.STEPS, "만보기", "하루 10,000보를 걸어보세요", "🚶‍♂️", Difficulty.HARD, 200, 10000),
            createChallenge(userId, ChallengeType.TRANSPORT, "대중교통이용하기", "대중교통을 이용하여 환경을 보호하세요", "🚌", Difficulty.MEDIUM, 300, 1),
            createChallenge(userId, ChallengeType.TUMBLER, "텀블러 이용하기", "카페에서 텀블러를 사용하고 인증하세요", "☕", Difficulty.MEDIUM, 400, 1)
        );
        
        challengeRepository.saveAll(challenges);
    }
    
    private Challenge getOrCreateChallenge(Long userId, ChallengeType challengeType) {
        return challengeRepository.findByUserIdAndChallengeType(userId, challengeType)
            .orElseGet(() -> {
                // 기본 챌린지 정보로 생성
                Challenge challenge = new Challenge();
                challenge.setUserId(userId);
                challenge.setChallengeType(challengeType);
                challenge.setStatus(ChallengeStatus.PENDING);
                challenge.setProgress(0);
                challenge.setRewardClaimed(false);
                
                // 챌린지 타입별 기본값 설정
                switch (challengeType) {
                    case ATTENDANCE:
                        challenge.setTitle("출석체크");
                        challenge.setDescription("매일 앱에 접속하여 출석체크를 완료하세요");
                        challenge.setIcon("📅");
                        challenge.setDifficulty(Difficulty.EASY);
                        challenge.setPoints(100);
                        challenge.setMaxProgress(1);
                        break;
                    case STEPS:
                        challenge.setTitle("만보기");
                        challenge.setDescription("하루 10,000보를 걸어보세요");
                        challenge.setIcon("🚶‍♂️");
                        challenge.setDifficulty(Difficulty.HARD);
                        challenge.setPoints(200);
                        challenge.setMaxProgress(10000);
                        break;
                    case TRANSPORT:
                        challenge.setTitle("대중교통이용하기");
                        challenge.setDescription("대중교통을 이용하여 환경을 보호하세요");
                        challenge.setIcon("🚌");
                        challenge.setDifficulty(Difficulty.MEDIUM);
                        challenge.setPoints(300);
                        challenge.setMaxProgress(1);
                        break;
                    case TUMBLER:
                        challenge.setTitle("텀블러 이용하기");
                        challenge.setDescription("카페에서 텀블러를 사용하고 인증하세요");
                        challenge.setIcon("☕");
                        challenge.setDifficulty(Difficulty.MEDIUM);
                        challenge.setPoints(400);
                        challenge.setMaxProgress(1);
                        break;
                }
                
                return challengeRepository.save(challenge);
            });
    }
    
    private void addPoints(Long userId, Integer points) {
        UserPoints userPoints = getUserPoints(userId);
        userPoints.setEarnedPoints(userPoints.getEarnedPoints() + points);
        userPointsRepository.save(userPoints);
    }
    
    private UserPoints getUserPoints(Long userId) {
        return userPointsRepository.findByUserId(userId)
            .orElseGet(() -> {
                UserPoints newUserPoints = new UserPoints();
                newUserPoints.setUserId(userId);
                return userPointsRepository.save(newUserPoints);
            });
    }
    
    private boolean isTodayAttendanceCompleted(Long userId) {
        // 오늘 출석체크 완료 여부 확인 로직
        return challengeRepository.findByUserIdAndChallengeType(userId, ChallengeType.ATTENDANCE)
            .map(challenge -> {
                if (challenge.getCompletedAt() == null) return false;
                return challenge.getCompletedAt().toLocalDate().equals(LocalDate.now());
            })
            .orElse(false);
    }
    
    private boolean checkTransportUsageFromFinanceAPI(Long userId) {
        // 소비내역 API 연동하여 대중교통 이용 확인
        // 실제 구현에서는 Finance API 호출
        return false; // 임시
    }
    
    private boolean processTumblerVerification(String imageData) {
        // OCR 처리 로직
        // 실제 구현에서는 OCR 서비스 호출
        return false; // 임시
    }
}
```

## 4. Controller 클래스

### ChallengeController.java
```java
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
@Validated
public class ChallengeController {
    
    private final ChallengeService challengeService;
    
    @GetMapping("/status")
    public ResponseEntity<BaseResponse<ChallengeStatusResponse>> getChallengeStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ChallengeStatusResponse response = challengeService.getChallengeStatus(userDetails.getUserId());
        return ResponseEntity.ok(BaseResponse.success(response));
    }
    
    @PostMapping("/attendance")
    public ResponseEntity<BaseResponse<ChallengeProgressResponse>> checkAttendance(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ChallengeProgressResponse response = challengeService.checkAttendance(userDetails.getUserId());
        return ResponseEntity.ok(BaseResponse.success(response));
    }
    
    @PostMapping("/steps")
    public ResponseEntity<BaseResponse<ChallengeProgressResponse>> updateSteps(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid StepsUpdateRequest request) {
        ChallengeProgressResponse response = challengeService.updateSteps(userDetails.getUserId(), request.getSteps());
        return ResponseEntity.ok(BaseResponse.success(response));
    }
    
    @PostMapping("/transport")
    public ResponseEntity<BaseResponse<ChallengeProgressResponse>> checkTransport(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ChallengeProgressResponse response = challengeService.checkTransport(userDetails.getUserId());
        return ResponseEntity.ok(BaseResponse.success(response));
    }
    
    @PostMapping("/tumbler")
    public ResponseEntity<BaseResponse<ChallengeProgressResponse>> verifyTumbler(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid TumblerVerificationRequest request) {
        ChallengeProgressResponse response = challengeService.verifyTumbler(userDetails.getUserId(), request.getImageData());
        return ResponseEntity.ok(BaseResponse.success(response));
    }
    
    @PostMapping("/reward")
    public ResponseEntity<BaseResponse<RewardClaimResponse>> claimReward(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid RewardClaimRequest request) {
        RewardClaimResponse response = challengeService.claimReward(
            userDetails.getUserId(), 
            request.getChallengeId(), 
            request.getChallengeType()
        );
        return ResponseEntity.ok(BaseResponse.success(response));
    }
    
    @PostMapping("/reset")
    public ResponseEntity<BaseResponse<Void>> resetDailyChallenges(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        challengeService.resetDailyChallenges();
        return ResponseEntity.ok(BaseResponse.success());
    }
}
```

## 5. DTO 클래스

### Request DTOs
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StepsUpdateRequest {
    @NotNull
    @Min(0)
    private Integer steps;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TumblerVerificationRequest {
    private String imageData;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardClaimRequest {
    @NotBlank
    private String challengeId;
    
    @NotBlank
    private String challengeType;
}
```

### Response DTOs
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeStatusResponse {
    private List<ChallengeDto> challenges;
    private Integer totalPoints;
    private Integer completedChallenges;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeProgressResponse {
    private Boolean success;
    private String challengeId;
    private String challengeType;
    private Integer progress;
    private Integer maxProgress;
    private Boolean isCompleted;
    private Integer pointsEarned;
    private String message;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardClaimResponse {
    private Boolean success;
    private Integer pointsEarned;
    private Integer totalPoints;
    private String message;
}
```

이 구현 예시를 참고하여 백엔드 개발자가 챌린지 시스템을 구현할 수 있습니다.

