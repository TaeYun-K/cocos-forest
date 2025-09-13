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
                // '/login' 페이지 자체는 인증 없이 누구나 볼 수 있도록 허용합니다. (무한 리디렉션 방지)
                .requestMatchers("/login", "/css/**", "/js/**").permitAll()
                // 그 외 모든 요청은 반드시 인증(로그인)을 거쳐야 합니다.
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                // 로그인 성공 시, 원래 가려던 페이지로 보내주되, 갈 곳이 없으면 '/'로 보냅니다.
                .defaultSuccessUrl("/", true)
            );;
        return http.build();
    }
}
