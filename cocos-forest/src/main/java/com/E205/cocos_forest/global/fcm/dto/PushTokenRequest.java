// PushTokenRequest.java
package com.E205.cocos_forest.global.fcm.dto;

import java.util.Map;

public record PushTokenRequest(
    String token,
    String userId,
    String deviceType, // "android" | "ios"
    Map<String, Object> deviceInfo // { isDevice, deviceName, osName, osVersion ... }
) {}
