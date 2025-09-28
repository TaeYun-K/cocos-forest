### 📘 Today I Learned

2025-09-18
Spring Security - 기본 계정 설정하기

오늘은 application.properties에 기본 계정을 설정하는 방법을 배웠다.

spring.security.user.name=admin
spring.security.user.password=password\_...

Spring Boot Security를 의존성만 추가하면 기본적으로 로그인 창이 뜨는데, 위와 같이 계정을 설정하면 지정한 아이디/비밀번호로 로그인할 수 있다.

운영 단계에서는 절대 이렇게 하드코딩하면 안 되고, 환경 변수나 Secret Manager 같은 안전한 방법을 사용해야 한다.

👉 테스트 단계에서 빠르게 로그인 동작을 확인할 수 있었다.
