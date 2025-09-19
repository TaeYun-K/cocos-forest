9월 19일 (금)

카드 연결 API 디버깅

POST /api/finance/user-cards 호출 시 500 에러 발생.

withdrawalDate 값을 "4"로 수정했지만 여전히 에러 발생 → withdrawalAccountNo가 SSAFY DB에 등록되지 않았을 가능성 확인.

DB Dummy 데이터 작업

ssafy_linkages 테이블에 user_id=5 더미 데이터 삽입 쿼리 작성.

user_id=8에 대한 card_transactions 테스트 데이터 삽입 작업.

JPA 복잡한 쿼리 관리

QueryDSL, Specification, Native Query 등 복잡한 조건문 관리 방식 학습.