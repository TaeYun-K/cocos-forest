### Spring Boot - OpenAPI 서버 URL 설정

오늘은 Spring Boot 프로젝트에서 OpenAPI 서버 URL을 설정하는 방법을 배웠다.

@OpenAPIDefinition(
    servers = {
        @Server(url = "https://myapp.dev", description = "개발 서버"),
        @Server(url = "https://myapp.com", description = "운영 서버")
    }
)


👉 로컬/개발/운영 환경을 분리해 API 문서를 더 명확하게 관리할 수 있다.