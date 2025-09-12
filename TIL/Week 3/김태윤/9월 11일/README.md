📝 9월 11일 TIL
학습 및 진행 내용

JPA 기반 코드 작성 시작

프로젝트 패키지 구조를 api와 global로 분리.

api/finance 내부에 dto.in, dto.out, service, controller 구성.

첫 구현 API: SSAFY 연동 생성 API → ssafy_linkages 테이블에 apiKey, userKey 저장하도록 설계.

AES-256 암호화는 MVP 단계에서 제외, 단순 저장 로직부터 진행.

BaseResponse 구조 반영

성공/실패를 단순화하지 않고, 프로젝트에서 정의한 BaseResponse, Request 형태를 유지.

Controller/ServiceImpl 코드를 이를 기반으로 수정.

Swagger 연동

SwaggerConfig 클래스 작성, /swagger-ui/index.html 에서 API 테스트 가능하도록 설정.

application.properties와 gradle 환경에 Swagger 관련 의존성 추가.

DB 연결 이슈

Spring Boot 실행 시 Hibernate에서 JDBCConnectionException 발생:

unable to obtain isolated JDBC connection [Communications link failure]


원인: DB 연결 정보 불일치 → Workbench에서는 SSH/TCP로 접속되지만, 애플리케이션에서는 별도 설정 필요.

SSH tunnel 설정에서 Host & port not found 오류도 확인 → DB 접속 경로 재점검.

보안 강화 고민

SSAFY linkage에 저장하는 userKey, apiKey 보안을 강화하는 방안 검토.

AES-256-GCM 방식 고려, 추후 암호화/복호화 유틸 추가 예정.

포인트/챌린지 로직 토론

나무 심기/물주기 결제 시 포인트 차감 처리 방식을 카탈로그 테이블 없이 상수화 방식으로 단순화.

Dry run 개념 학습: 실제 반영 전 시뮬레이션 실행.

챌린지 결과 평가는 새로고침 시점에 자동 업데이트되도록 설계.

인사이트

파일 구조를 처음부터 명확히 잡는 것이 코드 유지보수성과 협업 효율성을 크게 높여줌을 실감.

Swagger는 단순 테스트 도구를 넘어서 API 문서 자동화 역할까지 제공, 팀 단위 협업에서 필수적임.

DB 연결 오류를 통해 운영 환경과 개발 환경의 접속 방식 차이를 깊게 이해할 수 있었음.

보안은 MVP 단계에서는 단순화할 수 있으나, 추후에는 반드시 암호화/비밀키 관리가 필요함.

내일 할 일

DB 연결 오류 해결 (SSH tunnel vs direct connection).

daily_emissions 저장 API (/api/emissions/daily/save) 구현.

챌린지 평가 API와 포인트 적립 로직 실제 코드 작성.