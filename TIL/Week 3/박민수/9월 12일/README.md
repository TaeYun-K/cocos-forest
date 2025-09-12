### 📘 Today I Learned
2025-09-12
Docker - 컨테이너 로그 확인하기

오늘은 실행 중인 Docker 컨테이너의 로그를 확인하는 방법을 배웠다.

실시간 로그 보기

docker logs -f <컨테이너ID>


특정 라인 수만 확인하기

docker logs --tail 100 <컨테이너ID>


👉 -f 옵션으로 서버 로그를 실시간으로 추적할 수 있어서, Spring Boot 애플리케이션 실행 상태를 바로 확인할 때 유용했다.