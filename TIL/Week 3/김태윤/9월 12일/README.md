📝 9월 12일 TIL
학습 및 진행 내용

DB 연결 문제 해결 시도

Hibernate 로그에서 Communications link failure 확인 → JDBC 연결 실패.

원인 후보:

AWS 보안 그룹에서 MySQL 포트 미허용

SSH 터널 설정 문제 (Workbench에서는 접속 가능하지만, Spring Boot에서는 불가)

JDBC URL 오류 (예: jdbc:mysql://127.0.0.1:3306/sys 형태 재확인 필요)

Workbench 연결 성공을 바탕으로, Spring Boot application.properties의 DB URL과 SSH 포트 포워딩을 일치시키는 작업 진행.

Spring Security 비밀번호 이슈

UserDetailsService 기반 로그인 테스트 중, 비밀번호 해시가 DB에 저장되었음에도 로그인 시 인증 실패.

원인: PasswordEncoder 설정 누락 → DelegatingPasswordEncoder 대신 BCryptPasswordEncoder로 명시.

해결책: 회원가입 시점에서 비밀번호 해시를 적용하고, 로그인 비교에서도 동일한 Encoder 사용.

Swagger 테스트 진행

/swagger-ui/index.html 에서 API 정상 출력 확인.

다만 DB 연결 오류로 일부 API 호출이 실패 → Mock 데이터 기반 API 테스트 진행.

챌린지/포인트 API 보완

오늘의 챌린지 조회 API에서 날짜가 바뀌면 user_challenges를 새로 insert하지 않고, 응답 시점에서 진행률을 초기화하도록 변경.

어제 챌린지 성공 여부는 user_challenges.achieved_at 컬럼을 활용해 판정 가능.

포인트 사용/적립 로직을 MVP 단계에서는 단순화 → 차감/적립 내역을 points_ledger에 바로 기록.

MVP 발표 준비

문제 상황 정의:

탄소 배출량이 높아짐

생활 속 실천의 어려움

지속적인 참여의 어려움

이를 해결하기 위해 “코코의 숲” 기획 배경과 기대 효과 정리.

PPT용 기획 목표 4가지 작성 및 사회적 기대효과 정리.

인사이트

DB 연결 문제는 단순한 코드 문제가 아니라 인프라 설정 문제일 수 있음을 알게 됨. (보안 그룹, 포트 포워딩, JDBC URL 모두 확인 필요)

Spring Security에서 비밀번호 해싱은 필수이며, 회원가입과 로그인 로직의 Encoder 일치가 핵심임을 다시 학습.

챌린지/포인트 로직을 MVP 단계에서는 단순화하고, 추후 확장 시 구조화(예: 카탈로그 테이블)하는 접근이 현실적임을 확인.

기술 구현과 동시에 발표용 메시지를 정리하면서, 개발이 실제 서비스 기획과 어떻게 맞닿는지를 체감.

다음 주 할 일

DB 연결 완전 해결 (SSH vs Direct 접속 확인).

daily_emissions 저장 및 조회 API 실제 구현.

Swagger 기반으로 모든 API 시연 가능하도록 준비.

MVP 발표 자료 최종 점검 및 리허설 진행.