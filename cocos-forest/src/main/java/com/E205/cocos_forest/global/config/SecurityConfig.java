package com.E205.cocos_forest.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin())) // H2 콘솔 등 사용 시
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // ✅ 전체 허용
            )
            .formLogin(form -> form
                .loginPage("/login")
                // 로그인 성공 시, 원래 가려던 페이지로 보내주되, 갈 곳이 없으면 '/'로 보냅니다.
                .defaultSuccessUrl("/", true)
            );;
        return http.build();
    }
}
