package com.E205.cocos_forest.global.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Cocos Forest API",
                version = "v1",
                description = "E205 - Coco's Forest (SSAFY 금융 연동/챌린지/포인트) API 문서",
                contact = @Contact(name = "E205", email = "team-e205@example.com"),
                license = @License(name = "Apache 2.0")
        ),
        security = @SecurityRequirement(name = "bearerAuth") //jwt 토큰 헤더 추가
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT Authorization header using the Bearer scheme",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class SwaggerConfig {
        @Bean
        public OpenAPI openAPI(@Value("${app.openapi.server-url:/}") String serverUrl) {
                return new OpenAPI().servers(List.of(new Server().url(serverUrl)));
        }
}
