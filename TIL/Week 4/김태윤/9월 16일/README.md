9월 16일 (화)

카드 연결 API 설계

SSAFY API의 createCreditCard 활용, 사용자 카드 연결 API 초안 작성.

DB에는 card_no_masked 저장, 실제 카드 번호는 SSAFY API에서만 조회 가능하도록 구조 설계.

월별 거래내역 API 고민

실시간 SSAFY API 조회 vs DB 캐싱 전략 논의.

결제 이벤트 발생 시 DB에 저장 후, 일별/월별 조회는 DB에서 처리하는 방식이 효율적임을 확인.

에러 디버깅

기관 고유 거래 번호 생성 시 UUID → SSAFY 명세 규칙(날짜+난수)로 변경 필요.

WebClient 학습

비동기 처리 및 대용량 API 호출 시 장점 확인.