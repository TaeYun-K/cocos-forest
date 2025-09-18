package com.E205.cocos_forest.global.config.security;


import com.E205.cocos_forest.global.jwt.JwtAuthenticationFilter;
import com.E205.cocos_forest.global.jwt.JwtTokenProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * passwordEncoder(): BCryptPasswordEncoder를 Spring 컨테이너에 Bean으로 등록합니다.
     * 암호화, 비밀번호 검증 등에 사용됩니다.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // HTTP 기본 인증 비활성화
            .httpBasic(AbstractHttpConfigurer::disable)
            // CSRF 보호 비활성화 (Stateless한 JWT 사용 시에는 일반적으로 비활성화)
            .csrf(AbstractHttpConfigurer::disable)
            // CORS 설정 활성화
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 세션을 사용하지 않는 Stateless 서버 설정
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http
            // 요청 경로에 대한 인가 설정
            .authorizeHttpRequests(requests -> requests
                // 아래 경로에 대한 요청은 인증 없이 허용
                .requestMatchers(
                    "/api/user/login", // 로그인
                    "/api/user/signup", // 회원가입
                    "/api/email/**",
                    "/swagger-ui/**", // Swagger UI
                    "/v3/api-docs/**" // API 문서
                ).permitAll()
                // 위에서 지정한 경로 외의 모든 요청은 인증 필요
                .anyRequest().authenticated()
            );

        http
            // JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
            // 요청이 컨트롤러에 도달하기 전에 JWT 토큰을 검증합니다.
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS(Cross-Origin Resource Sharing) 설정을 위한 Bean
     * 다른 도메인에서의 요청을 허용하도록 설정합니다.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 허용할 Origin(출처) 설정. "*"는 모든 출처를 허용하지만, 실제 프로덕션에서는 특정 도메인을 지정하는 것이 안전합니다.
        configuration.setAllowedOrigins(List.of("*"));
        // 허용할 HTTP 메서드 설정
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // 허용할 HTTP 헤더 설정
        configuration.setAllowedHeaders(List.of("*"));
        // 자격 증명(쿠키, 인증 헤더 등)을 포함한 요청 허용
        configuration.setAllowCredentials(true);
        // OPTIONS 요청에 대한 pre-flight 응답 캐시 시간 설정
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로에 대해 위에서 정의한 CORS 설정 적용
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
