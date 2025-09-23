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
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final ResourceLoader resourceLoader;

    @Value("${fcm.service-account-file.location}")
    private String serviceAccountLocation; // ex) classpath:keys/firebase-service-account.json or file:/run/secrets/firebase.json

    @Value("${fcm.topic-name}")
    private String topicName;

    @Value("${fcm.project-id}")
    private String projectId;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // location 접두어(classpath:, file:)를 그대로 해석
                Resource resource = resourceLoader.getResource(serviceAccountLocation);
                if (!resource.exists()) {
                    throw new IllegalStateException("FCM service account resource not found: " + serviceAccountLocation);
                }
                try (InputStream in = resource.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(in))
                        .setProjectId(projectId)
                        .build();
                    FirebaseApp.initializeApp(options);
                }
                log.info("Firebase 초기화 완료 (location={})", serviceAccountLocation);
            } else {
                log.info("Firebase 이미 초기화됨");
            }
        } catch (Exception e) {
            log.error("Firebase 초기화 실패 (location={})", serviceAccountLocation, e);
            throw new RuntimeException("Firebase 초기화 실패", e);
        }
    }

    public void sendMessageByTopic(String title, String body) throws IOException, FirebaseMessagingException {
        FirebaseMessaging.getInstance().send(
            Message.builder()
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .setTopic(topicName)
                .build()
        );
    }

    public void sendMessageByToken(String title, String body, String token) throws FirebaseMessagingException {
        FirebaseMessaging.getInstance().send(
            Message.builder()
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .setToken(token)
                .build()
        );
    }
}
