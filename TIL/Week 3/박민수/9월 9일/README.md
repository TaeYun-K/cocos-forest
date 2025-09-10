✅ 오늘의 학습 기록 예시
2. Spring Boot - Whitelabel Error Page

/error 매핑이 없을 경우 발생하는 기본 에러 페이지.

해결 방법:

@ControllerAdvice를 활용해 에러 핸들링 페이지 작성.

혹은 src/main/resources/templates/error.html을 만들어 커스텀 에러 페이지 제공.