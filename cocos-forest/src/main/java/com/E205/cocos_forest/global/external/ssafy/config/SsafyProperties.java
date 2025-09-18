// global/external/ssafy/config/SsafyProperties.java
package com.E205.cocos_forest.global.external.ssafy.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.ssafy")
public class SsafyProperties {
    private String baseUrl;
    private String institutionCode;
    private String fintechAppNo;
    private String apiKey;
}
