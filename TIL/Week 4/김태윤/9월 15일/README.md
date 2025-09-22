9월 15일 (월)

은행/계좌 API 설계 및 구현

Bank 엔티티, Repository, DTO, Controller를 작성하여 은행 목록 조회 API 완성.

Swagger 기반 API 문서화 설정 점검.

계좌·카드 연결 구조 설계

사용자별 여러 계좌와 카드 연동 가능하도록 DB 구조 및 API 설계 고민.

deleteByUserId() 메서드가 SSAFY API와 무관하게 DB에서만 삭제 처리됨을 확인.

JPA 학습

findByCategoryId, findByCategoryIdIn 사용 시 자동 쿼리 생성 및 Index 최적화 학습.

Swagger 서버 설정 문제

로컬에서 /dev prefix 문제 발생 → application.properties 환경 분리 필요 확인.