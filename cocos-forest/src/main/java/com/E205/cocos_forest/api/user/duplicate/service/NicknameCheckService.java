package com.E205.cocos_forest.api.user.duplicate.service;

import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NicknameCheckService {

    private final UserRepository userRepository;

    /**
     * 닉네임 중복 확인 (✨ 추가된 부분)
     * @param nickname 중복 확인할 닉네임
     */
    public void checkNicknameDuplicate(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            // 이미 닉네임이 존재하면 예외 발생
            throw new BaseException(BaseResponseStatus.DATABASE_CONSTRAINT_VIOLATION);
        }
    }
}