package com.E205.cocos_forest.global.fcm.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    // 비밀키 경로 환경 변수 ( 필수 )
    @Value("${fcm.service-account-file}")
    private String serviceAccountFilePath;

    // topic 이름 환경 변수
    @Value("${fcm.topic-name}")
    private String topicName;

    // 프로젝트 아이디 환경 변수 ( 필수 )
    @Value("${fcm.project-id}")
    private String projectId;


    @PostConstruct
    public void initialize() {
        try {
            // FirebaseApp이 이미 초기화되어 있는지 확인
            if (FirebaseApp.getApps().isEmpty()) {
                // 아직 초기화되지 않은 경우에만 초기화
                ClassPathResource resource = new ClassPathResource(serviceAccountFilePath);
                FileInputStream serviceAccount = new FileInputStream(resource.getFile());

                FirebaseOptions options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                                .setProjectId(projectId)
                                .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase 초기화 완료");
            } else {
                log.info("Firebase 이미 초기화됨");
            }

        } catch (IOException e) {
            log.error("Firebase 초기화 실패", e);
            throw new RuntimeException("Firebase 초기화 실패", e);
        }
    }

    // 해당 지정된 topic에 fcm를 보내는 메서드
    public void sendMessageByTopic(String title, String body) throws IOException, FirebaseMessagingException {
        FirebaseMessaging.getInstance().send(Message.builder()
                        .setNotification(Notification.builder()
                                        .setTitle(title)
                                        .setBody(body)
                                        .build())
                        .setTopic(topicName)
                        .build());

    }
    // 받은 token을 이용하여 fcm를 보내는 메서드
    public void sendMessageByToken(String title, String body,String token) throws FirebaseMessagingException{
        FirebaseMessaging.getInstance().send(Message.builder()
                        .setNotification(Notification.builder()
                                        .setTitle(title)
                                        .setBody(body)
                                        .build())
                        .setToken(token)
                        .build());
    }

}
