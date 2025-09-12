// global/external/ssafy/SsafyProperties.java
package com.E205.cocos_forest.global.external.ssafy;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
@ConfigurationProperties(prefix = "app.ssafy")
public class SsafyProperties {
    private String baseUrl;
    private String orgCode;
    private String fintechAppNo;
    private String apiKey;

    public void setBaseUrl(String v){ this.baseUrl = v; }
    public void setOrgCode(String v){ this.orgCode = v; }
    public void setFintechAppNo(String v){ this.fintechAppNo = v; }
    public void setApiKey(String v){ this.apiKey = v; }
}
