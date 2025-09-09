# Java 17 버전을 기반으로 이미지를 만듭니다.
FROM openjdk:17-jdk-slim

# 빌드된 .jar 파일이 위치할 경로를 변수로 지정합니다.
ARG JAR_FILE=build/libs/*.jar

# 위 경로의 .jar 파일을 app.jar 라는 이름으로 컨테이너 안에 복사합니다.
COPY ${JAR_FILE} app.jar

# 컨테이너가 시작될 때 app.jar를 실행하는 명령입니다.
ENTRYPOINT ["java","-jar","/app.jar", "--spring.config.location=file:/config/application.properties"]