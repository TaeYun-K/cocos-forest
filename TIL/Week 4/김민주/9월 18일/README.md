## 9/18 (목) - 백엔드 API 연동 작업

### 오늘 한 일
- 목업데이터 기반 시스템을 실제 백엔드 API와 연결
- Axios HTTP 클라이언트 설정부터 JWT 토큰 인증까지 전체 API 연동

### Axios HTTP 클라이언트 설정
- api/axios.ts 파일에 axios 인스턴스 생성
- baseURL 환경변수 관리
- timeout, 기본 헤더 설정
- 요청 인터셉터로 JWT 토큰 자동 첨부 구현

### 인증 API 서비스 구현
- 로그인: POST /auth/login
- 회원가입: POST /auth/signup
- 이메일 인증: POST /auth/send-verification, POST /auth/verify-code
- 중복 확인: GET /auth/check-email, GET /auth/check-nickname
- 각 기능별 API 함수 체계적 작성

### Mock API 제거 및 실제 연동
- 기존 mockApi.ts 파일 제거
- authStore에서 실제 authService 호출로 교체
- AsyncStorage 활용한 토큰 저장 로직 구현

### JWT 토큰 기반 인증 구현
- AsyncStorage 토큰 영속성 확보
- 앱 시작 시 저장된 토큰으로 자동 로그인
- 토큰 만료 시 자동 로그아웃 처리
- 응답 인터셉터 추가

### API 에러 핸들링 강화
- 응답 인터셉터 공통 에러 처리 로직
- 401 에러 발생 시 자동 로그아웃 처리
- 사용자 친화적 에러 메시지 표시

### 로그인/로그아웃/회원가입 플로우 완성
- 성공 시 자동 메인 화면 이동
- 실패 시 사용자 친화적 에러 메시지
- 로딩 상태 관리로 적절한 사용자 피드백

### 배운 점
- REST API 통신에서 인터셉터 패턴의 강력함
- JWT 토큰 기반 인증의 프론트엔드 구현 방법
- React Native AsyncStorage 데이터 영속성 구현
- API 에러 처리에서 사용자 경험 고려의 중요성