📝 9월 10일 TIL
학습 및 진행 내용

API 명세 구체화

인터페이스 설계서와 기능 명세서를 기반으로 각 API의 흐름을 상세화.

특히 금융 API와 연결되는 핵심 흐름을 세 가지로 정리:

월별 카드 결제내역 조회 → 외부(SSAFY)에서 데이터 가져와 DB에 업서트

하루 카드 결제 상세 조회 → 내 DB에서 조회 (성능 최적화)

결제 이벤트 발생 처리 → /api/internal/events/payment 로 거래내역 즉시 DB 반영

사용자가 달력을 넘기면, 월 단위로 API 호출 → 캐싱 또는 인덱싱을 통한 최적화 고려.

DB 정합성 문제 해결

merchants 테이블 insert 시, FK 제약 조건 오류(category_id 불일치) 발생.

이를 해결하기 위해, categories 테이블을 먼저 insert → merchants insert 순서 조정.

결과적으로 merchants와 categories 정상 연결 완료.

챌린지/포인트 로직 점검

챌린지 평가를 유저 이벤트로 하지 않고, 자동 평가로 단순화.

user_challenges.achieved_at 기준으로 성공 여부 판단.

포인트 적립/차감은 points_ledger 테이블에 기록되며, reason 필드로 구분(CHALLENGE_REWARD, PLANT, WATER).

SSAFY API 테스트

inquireSignUpCreditCardList API 호출 시 정상 응답(H0000) 확인.

다만, createCreditCard API 호출 시 없는 상품입니다 오류 발생 → 상품번호/카드번호 매핑 로직 확인 필요.

인사이트

단순한 API 조회보다는 DB 적재 + 조회 구조가 안정적임을 재확인.

결제 이벤트 처리 API를 별도로 둠으로써, 실시간 시뮬레이션 가능성을 확보.

FK 오류 경험을 통해, 데이터 적재 순서 및 초기 데이터 설계의 중요성을 깨달음.

SSAFY 금융 API 응답 패턴을 직접 확인하면서, 에러 응답 케이스 처리를 반드시 고려해야 함을 확인.

내일 할 일

Swagger 환경 설정 및 /swagger-ui 기반 API 테스트.

daily_emissions 계산 로직 (transaction.amount × emission_factor) 구현 시작.

챌린지 결과 평가 API(/api/challenges/{id}/evaluate) 세부 로직 설계.