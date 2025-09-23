package com.E205.cocos_forest.global.fcm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class MessageRequestDTO {
    private String title;
    private String body;
    private String targetToken;
}
