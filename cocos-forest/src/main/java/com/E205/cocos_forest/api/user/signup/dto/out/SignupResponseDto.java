package com.E205.cocos_forest.api.user.signup.dto.out;

import com.E205.cocos_forest.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
public class SignupResponseDto {
    private final Long id;
    private final String nickname;
    private final String email;

    @Builder
    public SignupResponseDto(Long id, String nickname, String email) {
        this.id = id;
        this.nickname = nickname;
        this.email = email;
    }

    public static SignupResponseDto from(User user) {
        return SignupResponseDto.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .build();
    }
}