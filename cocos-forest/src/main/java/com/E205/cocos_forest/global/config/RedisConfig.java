package com.E205.cocos_forest.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * @Configuration: 이 클래스가 Spring의 설정 파일임을 나타냅니다.
 *
 * RedisConnectionFactory: Redis 서버와의 연결을 설정합니다. Lettuce는 고성능 Redis 클라이언트 라이브러리입니다.
 *
 * RedisTemplate: Redis의 데이터 조작을 돕는 템플릿입니다.
 * 여기서는 Key와 Value를 모두 String 형태로 저장하고 조회할 것이므로 StringRedisSerializer를 설정했습니다.
 * 이렇게 해야 Redis CLI에서 데이터를 확인할 때 알아볼 수 있는 형태로 보입니다.
 */
@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String host;

    @Value("${spring.data.redis.port}")
    private int port;

    // Redis 저장소와 연결하는 과정을 관리하는 Bean
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    // RedisTemplate: Redis와 상호작용할 때 Key, Value의 직렬화 방식을 설정
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());

        // Key: String, Value: String 형태로 직렬화
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        
        return redisTemplate;
    }
}