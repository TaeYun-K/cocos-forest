package com.E205.cocos_forest.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))

            // [핵심 설정] 대부분의 요청은 인증을 요구하도록 설정합니다.
            .authorizeHttpRequests(auth -> auth
                // 로그인 페이지, CSS/JS 파일 등은 인증 없이 접근 허용
                .requestMatchers("/css/**", "/js/**", "/favicon.ico").permitAll()
                // 그 외 모든 요청은 반드시 인증(로그인)을 거쳐야 함
                .anyRequest().authenticated()
            );

        return http.build();
    }
}