package com.E205.cocos_forest.global.config.ai;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.vertexai.VertexAI;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

@Configuration
/*
 * Spring Boot 애플리케이션이 Google Cloud Platform(GCP) 서비스와 통신하는 데 필요한 핵심 클라이언트 객체(Bean)를 생성하고 구성하는 역할
 *
 */
public class GoogleCloudConfig {

  /*
   * @Value 어노테이션을 사용하여 application.properties 또는 application.yml 파일에 정의된 GCP 프로젝트 ID, 인증 키 파일 경로, Vertex AI 리전 등의 값을 주입
   */
  @Value("${gcp.project.id}")
  private String projectId;

  @Value("${gcp.credentials.location}")
  private String credentialsPath;

  @Value("${vertex.ai.location}")
  private String location;

  /**
   * 서비스 계정 자격 증명을 로드
   *
   * @return GoogleCredentials 객체
   * @throws IOException 자격 증명 파일 로드 실패 시
   */
  @Bean
  public GoogleCredentials googleCredentials() throws IOException {
    // 1) Jenkins에서 주입하는 Base64 비밀(권장)
    String b64 = System.getenv("GCP_CREDENTIALS_BASE64");
    if (b64 != null && !b64.isBlank()) {
      byte[] decoded = Base64.getDecoder().decode(b64);
      try (var in = new ByteArrayInputStream(decoded)) {
        return GoogleCredentials.fromStream(in)
            .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
      }
    }

    // 2) 기존 파일 경로 방식 (classpath:, file:, 일반 경로)
    if (credentialsPath == null || credentialsPath.isBlank()) {
      throw new FileNotFoundException(
          "No GCP credentials: set env GCP_CREDENTIALS_BASE64 or property gcp.credentials.location");
    }

    if (credentialsPath.startsWith("classpath:")) {
      String relativePath = credentialsPath.replaceFirst("^classpath:", "");
      Resource resource = new ClassPathResource(relativePath);
      try (var in = resource.getInputStream()) {
        return GoogleCredentials.fromStream(in)
            .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
      }
    } else {
      // file: 접두어 제거
      String cleanPath = credentialsPath.replaceFirst("^file:", "");
      File f = new File(cleanPath);
      if (f.isDirectory()) {
        // 과거 에러 메시지와 동일 원인 대비
        throw new FileNotFoundException(cleanPath + " is a directory, expected a JSON file");
      }
      try (var in = new FileInputStream(f)) {
        return GoogleCredentials.fromStream(in)
            .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
      }
    }
  }

  /**
   * VertexAI 클라이언트 빈을 생성
   * 생성된 GoogleCredentials를 사용하여 Vertex AI와 통신할 수 있는 VertexAI 클라이언트 객체를 생성
   * 요청을 보낼 GCP 프로젝트 ID와 리전(location) 정보가 함께 설정
   *
   * @param credentials 인증을 위한 GoogleCredentials
   * @return VertexAI 클라이언트 인스턴스
   * @throws IOException
   */
  @Bean
  public VertexAI vertexAI(GoogleCredentials credentials) throws IOException {
    return new VertexAI.Builder()
        .setProjectId(projectId)
        .setLocation(location)
        .setCredentials(credentials)
        .build();
  }

  /**
   * Google Cloud Storage 클라이언트 빈을 생성
   * GoogleCredentials를 사용하여 Google Cloud Storage(GCS)와 상호작용(파일 업로드, 삭제 등)할 수 있는 Storage 클라이언트 객체를 생성
   *
   * @param credentials 인증을 위한 GoogleCredentials
   * @return Storage 클라이언트 인스턴스
   * @throws IOException
   */
  @Bean
  public Storage storage(GoogleCredentials credentials) throws IOException {
    return StorageOptions.newBuilder()
        .setProjectId(projectId)
        .setCredentials(credentials)
        .build()
        .getService();
  }
}
