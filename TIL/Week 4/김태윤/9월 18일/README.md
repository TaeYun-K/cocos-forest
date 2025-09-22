9월 18일 (목)

챌린지 서비스 로직 설계

하루가 지났을 때 챌린지 초기화/재생성 플로우 논의.

user_challenges 테이블에 매일 챌린지 기록이 누적되며, challenge_date 기반으로 오늘/어제 챌린지 구분.

챌린지 보상 수령 설계

자정 시 자동 보상 처리 + 사용자가 수동으로 보상받을 수 있는 플로우 정리.

DB 설계 점검

user_challenges의 Unique Key(user_id + challenge_id + challenge_date) 구조 재확인.

JSON 응답 구조 학습

SSAFY 카드 거래 API 응답에서 transactions, meta, totals 구조 파악.