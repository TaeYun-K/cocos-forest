📝 9월 8일 TIL
학습 및 진행 내용

챌린지 설계 고도화

챌린지를 유동적으로 생성하는 것이 아니라, 5개 고정 챌린지로 설계.

DB 설계 시 challenges 테이블에 미리 데이터를 Insert하여 운영.

챌린지 타입을 AMOUNT, EMISSION, ATTENDANCE, STEPS로 구분하여 조건 관리.

카테고리 ID가 없는 챌린지는 출석 체크·걸음 수 챌린지로 매핑하여 확장성 확보.

카테고리 관리

SSAFY 카드 API의 카테고리 데이터(주유, 교통, 대형마트, 생활 등)를 DB categories에 Insert.

카테고리별 탄소 배출 계수(kgCO₂e/원)를 emission_factors 테이블로 관리하도록 설계.

API 명세 설계

/api/challenges/today : 오늘의 챌린지 조회

/api/challenges/{id}/evaluate : 챌린지 결과 평가 및 포인트 지급

/api/points/ledger : 포인트 내역 조회.

DB 스키마 초안 작성

user_challenges : 사용자별 챌린지 진행 상태 관리

points_ledger : 포인트 적립/차감 이력 관리

daily_emissions : 일자별 탄소 배출량 저장.

인사이트

챌린지를 유저 이벤트 기반으로 만드는 대신, 자동 생성 및 자동 평가 로직으로 단순화하여 사용자의 진입 장벽을 낮출 수 있음을 확인.

배출량은 카테고리별 소비 × 배출계수로 계산하므로, DB 차원에서 매핑 구조를 잘 설계하는 것이 중요함.

포인트 시스템은 단순히 지급/사용 내역만 저장하는 것이 아니라, 참조 ID를 남겨 이력이 추적 가능하도록 설계하는 것이 핵심임.

내일 할 일

SSAFY 카드 결제내역 API 연동 테스트 진행.

결제내역 → DB card_transactions 적재 로직 설계.

Swagger 환경 구성 시작.