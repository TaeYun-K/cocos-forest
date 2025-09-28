package com.E205.cocos_forest.global.config.security;

import com.E205.cocos_forest.global.jwt.JwtAuthenticationFilter;
import com.E205.cocos_forest.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests((requests) -> requests
                // 공개 접근 허용 경로들
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                // 인증/회원가입 관련 (인증 불필요)
                .requestMatchers(
                    "/api/email/**",
                    "/api/user/**").permitAll()

                            // ✅ 푸시 토큰 등록용 API도 인증 없이 접근 허용
                            .requestMatchers(HttpMethod.POST, "/api/push-token").permitAll()

                // 그 외 모든 API는 인증 필요
                .requestMatchers("/api/**").authenticated()

                // 기타 모든 요청 허용 (정적 리소스 등)
                .anyRequest().permitAll()
            )

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
      configuration.setAllowedMethods(
          Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
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
