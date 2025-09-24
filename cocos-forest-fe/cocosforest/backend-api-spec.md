# 챌린지 시스템 백엔드 API 명세서

## 개요
프론트엔드에서 챌린지 진행 상황을 백엔드로 전송하고, 백엔드에서 챌린지 상태를 관리하는 API입니다.

## 데이터베이스 설계

### 1. Challenge 테이블
```sql
CREATE TABLE challenge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    challenge_type VARCHAR(20) NOT NULL, -- 'attendance', 'steps', 'transport', 'tumbler'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    difficulty VARCHAR(10) NOT NULL, -- 'easy', 'medium', 'hard'
    points INT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'in_progress', 'completed', 'failed'
    progress INT NOT NULL DEFAULT 0,
    max_progress INT NOT NULL,
    completed_at DATETIME NULL,
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_challenge_type (user_id, challenge_type)
);
```

### 2. ChallengeProgress 테이블 (진행 이력)
```sql
CREATE TABLE challenge_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    challenge_id BIGINT NOT NULL,
    progress_value INT NOT NULL,
    additional_data JSON, -- 걸음수, 대중교통 이용 여부 등 추가 데이터
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenge_id) REFERENCES challenge(id)
);
```

### 3. UserPoints 테이블 (포인트 관리)
```sql
CREATE TABLE user_points (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_points INT NOT NULL DEFAULT 0,
    earned_points INT NOT NULL DEFAULT 0,
    used_points INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
);
```

## API 엔드포인트

### 1. 챌린지 상태 조회
```
GET /api/challenges/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": "1",
        "type": "attendance",
        "title": "출석체크",
        "description": "매일 앱에 접속하여 출석체크를 완료하세요",
        "icon": "📅",
        "difficulty": "easy",
        "points": 100,
        "status": "completed",
        "progress": 1,
        "maxProgress": 1,
        "completedAt": "2024-01-15T09:00:00Z",
        "rewardClaimed": true
      }
    ],
    "totalPoints": 1000,
    "completedChallenges": 1
  }
}
```

### 2. 출석체크
```
POST /api/challenges/attendance
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "1",
  "challengeType": "attendance",
  "progress": 1,
  "maxProgress": 1,
  "isCompleted": true,
  "pointsEarned": 100,
  "message": "출석체크가 완료되었습니다."
}
```

### 3. 걸음수 업데이트
```
POST /api/challenges/steps
Authorization: Bearer {token}
Content-Type: application/json

{
  "steps": 8500
}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "2",
  "challengeType": "steps",
  "progress": 8500,
  "maxProgress": 10000,
  "isCompleted": false,
  "pointsEarned": 0,
  "message": "걸음수가 업데이트되었습니다."
}
```

### 4. 대중교통 이용 확인
```
POST /api/challenges/transport
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "3",
  "challengeType": "transport",
  "progress": 1,
  "maxProgress": 1,
  "isCompleted": true,
  "pointsEarned": 300,
  "message": "대중교통 이용이 확인되었습니다."
}
```

### 5. 텀블러 인증
```
POST /api/challenges/tumbler
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageData": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "challengeId": "4",
  "challengeType": "tumbler",
  "progress": 1,
  "maxProgress": 1,
  "isCompleted": true,
  "pointsEarned": 400,
  "message": "텀블러 인증이 완료되었습니다."
}
```

### 6. 보상 수령
```
POST /api/challenges/reward
Authorization: Bearer {token}
Content-Type: application/json

{
  "challengeId": "1",
  "challengeType": "attendance"
}
```

**Response:**
```json
{
  "success": true,
  "pointsEarned": 100,
  "totalPoints": 1000,
  "message": "보상이 수령되었습니다."
}
```

### 7. 일일 챌린지 리셋 (스케줄러)
```
POST /api/challenges/reset
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

## 비즈니스 로직

### 1. 출석체크
- 하루에 한 번만 가능
- 중복 출석체크 시 오류 반환
- 완료 시 즉시 포인트 지급

### 2. 걸음수
- 실시간 업데이트 가능
- 10,000보 달성 시 자동 완료 처리
- 최대값은 10,000보로 제한

### 3. 대중교통
- 소비내역 API 연동하여 자동 감지
- 하루에 한 번만 완료 가능

### 4. 텀블러
- OCR을 통한 영수증 인증
- 카페 이용 내역과 연동하여 검증

### 5. 포인트 관리
- 챌린지 완료 시 자동으로 포인트 적립
- 보상 수령 시에만 실제 포인트 지급
- 중복 수령 방지

## 스케줄러
- 매일 새벽 2시에 일일 챌린지 리셋
- 출석체크, 걸음수, 대중교통, 텀블러 챌린지 초기화

## 에러 처리
- 인증되지 않은 사용자: 401 Unauthorized
- 이미 완료된 챌린지: 400 Bad Request
- 서버 오류: 500 Internal Server Error

## 보안 고려사항
- JWT 토큰을 통한 사용자 인증
- 사용자별 챌린지 데이터 격리
- API 호출 빈도 제한 (Rate Limiting)

