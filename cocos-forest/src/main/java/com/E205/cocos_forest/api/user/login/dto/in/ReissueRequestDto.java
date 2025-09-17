package com.E205.cocos_forest.api.user.login.dto.in;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReissueRequestDto {
    private String refreshToken;
}