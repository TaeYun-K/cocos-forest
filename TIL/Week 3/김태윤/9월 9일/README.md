📝 9월 9일 TIL
학습 및 진행 내용

SSAFY 카드 API 분석

inquireCreditCardTransactionList API를 통해 카드 거래내역을 조회하는 방식 확인.

요청 시 카드번호, CVC, 기간(startDate, endDate)이 필요하며, 응답으로 거래 고유번호, 카테고리ID, 가맹점ID, 거래금액 등을 받음.

응답 구조를 기반으로 DB의 card_transactions 테이블에 매핑 설계.

DB 스키마 수정

card_transactions 테이블에 user_id, transaction_no, category_id, merchant_id, amount_krw, status 등을 반영.

외래키 제약 조건(categories, merchants, users)을 추가하여 데이터 무결성 확보.

merchants 테이블 생성 및 더미 데이터 삽입 (예: SK에너지, 이마트, 스타벅스 등)으로 카테고리와 연결.

외래키 오류 해결

card_transactions → categories 매핑 과정에서 FK 제약 조건 오류 발생.

이를 해결하기 위해 카테고리 동기화 API(inquireCategoryList)와 DB categories Insert 쿼리 활용.

챌린지 데이터 Insert

challenges 테이블에 5개의 고정 챌린지 데이터 생성:

교통 절약 챌린지 🚇

생활소비 줄이기 챌린지 ☕

대형마트 절약 챌린지 🛒

출석 체크 챌린지 📅

걸음 수 챌린지 👣.

API 명세 보완

카드 거래 동기화 API를 월별, 일별로 분리:

/api/sync/transactions/monthly

/api/transactions/days/{date}.

결제 이벤트 발생 시, /api/internal/events/payment API에서 즉시 DB insert 이벤트 처리하도록 설계.

인사이트

단순 조회 API를 그대로 쓰는 것보다, 내 DB에 적재 후 조회하는 방식이 훨씬 효율적임을 확인.

FK 오류를 통해 초기 데이터 동기화의 중요성을 다시 한 번 체감. 운영 전 반드시 카테고리/가맹점 기준 데이터를 준비해야 함.

챌린지를 고정 값으로 설계하면서 MVP 단계에서는 빠른 검증이 가능하다는 장점이 있음.

내일 할 일

Swagger 연동 준비 및 API 테스트 환경 구축.

daily_emissions 저장 로직 설계 (카테고리별 소비금액 × 탄소 배출계수).

챌린지 평가 로직 초안 작성.