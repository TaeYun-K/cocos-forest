# 1. 기반 이미지 설정: Java 17 환경을 사용합니다.
FROM openjdk:17-jdk-slim

# 2. 빌드된 Jar 파일 경로를 변수로 지정합니다.
ARG JAR_FILE=build/libs/*.jar

# 3. Jar 파일을 컨테이너 내부로 복사하고 이름을 app.jar로 변경합니다.
COPY ${JAR_FILE} app.jar

# 4. 컨테이너가 시작될 때 실행될 명령어를 지정합니다.
# Jenkins에서 주입해준 외부 설정 파일을 사용하도록 경로를 지정합니다.
ENTRYPOINT ["java","-jar","/app.jar"]