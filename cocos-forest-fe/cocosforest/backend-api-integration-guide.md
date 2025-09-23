# 백엔드 API 연동 가이드

## 현재 상태
- 프론트엔드에서 가상 API를 사용하여 챌린지 시스템이 구현됨
- 결제내역 API는 이미 구현되어 있어서 대중교통/카페 이용 감지 가능
- 백엔드 개발 완료 후 간단한 설정 변경으로 실제 API 연동 가능

## 백엔드 API 연동 방법

### 1. API 설정 변경
`src/config/apiConfig.ts` 파일에서 다음 설정을 변경:

```typescript
export const API_CONFIG = {
  // 이 값을 false로 변경
  USE_MOCK_API: false,
  
  // 백엔드 서버 주소로 변경
  BASE_URL: 'http://your-backend-server.com:8080',
  
  // 나머지 설정은 그대로 유지
  // ...
};
```

### 2. 백엔드에서 구현해야 할 API 엔드포인트

#### 2.1 챌린지 상태 조회
```
GET /api/challenges/status
Authorization: Bearer {token}
```

#### 2.2 출석체크
```
POST /api/challenges/attendance
Authorization: Bearer {token}
```

#### 2.3 걸음수 업데이트
```
POST /api/challenges/steps
Authorization: Bearer {token}
Content-Type: application/json

{
  "steps": 8500
}
```

#### 2.4 대중교통 이용 확인
```
POST /api/challenges/transport
Authorization: Bearer {token}
```

#### 2.5 텀블러 인증
```
POST /api/challenges/tumbler
Authorization: Bearer {token}
Content-Type: application/json

{
  "imageData": "base64_encoded_image_data"
}
```

#### 2.6 보상 수령
```
POST /api/challenges/reward
Authorization: Bearer {token}
Content-Type: application/json

{
  "challengeId": "attendance",
  "challengeType": "attendance"
}
```

### 3. 현재 구현된 기능들

#### 3.1 자동 감지 기능
- **대중교통 이용**: 결제내역 API에서 자동 감지
- **카페 이용**: 결제내역 API에서 자동 감지
- **새로고침**: 헤더의 🔄 버튼으로 결제내역 재확인

#### 3.2 챌린지 타입별 처리
- **출석체크**: 사용자가 직접 버튼 클릭
- **만보기**: 삼성헬스 SDK 연동, 실시간 걸음수 업데이트
- **대중교통**: 결제내역 자동 감지 후 챌린지 완료
- **텀블러**: 카페 이용 감지 후 OCR 인증 필요

### 4. 데이터 흐름

```
1. 앱 시작 → 결제내역 API 호출 → 대중교통/카페 이용 감지
2. 사용자 액션 (출석체크, 걸음수 새로고침) → 백엔드 API 호출
3. 챌린지 완료 → 보상 수령 → 포인트 지급
```

### 5. 백엔드 개발 시 참고사항

#### 5.1 데이터베이스 설계
- `challenge` 테이블: 챌린지 상태 관리
- `user_points` 테이블: 포인트 관리
- `challenge_progress` 테이블: 진행 이력

#### 5.2 비즈니스 로직
- 하루에 한 번만 출석체크 가능
- 걸음수는 실시간 업데이트 가능
- 대중교통/카페는 결제내역 기반 자동 감지
- 보상은 챌린지 완료 후에만 수령 가능

#### 5.3 스케줄러
- 매일 새벽 2시에 일일 챌린지 리셋
- 출석체크, 걸음수, 대중교통, 텀블러 챌린지 초기화

### 6. 테스트 방법

#### 6.1 가상 API 테스트
현재 `USE_MOCK_API: true` 상태에서 모든 기능 테스트 가능

#### 6.2 실제 API 테스트
1. `USE_MOCK_API: false`로 변경
2. `BASE_URL`을 실제 백엔드 주소로 설정
3. 백엔드 서버 실행
4. 앱에서 API 호출 테스트

### 7. 주의사항

- 백엔드 코드는 절대 수정하지 않음
- 프론트엔드에서만 API 연동 설정 변경
- 결제내역 API는 이미 구현되어 있어서 그대로 사용
- JWT 토큰 인증이 필요할 경우 axios 설정에서 처리

### 8. 완성된 기능 목록

✅ 챌린지 UI 구현 (4가지 챌린지 카드)  
✅ 출석체크 기능  
✅ 만보기 기능 (삼성헬스 SDK 연동)  
✅ 대중교통 이용 자동 감지 (결제내역 API 연동)  
✅ 텀블러 인증 기능 (OCR 시뮬레이션)  
✅ 보상 수령 시스템  
✅ 결제내역 새로고침 기능  
✅ 가상 API → 실제 API 전환 준비 완료  

백엔드 개발 완료 후 `apiConfig.ts`의 `USE_MOCK_API`만 `false`로 변경하면 바로 실제 API 연동이 가능합니다!

