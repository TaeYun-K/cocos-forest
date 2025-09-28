package com.E205.cocos_forest.api.user.myprofile.service;

import com.E205.cocos_forest.api.finance.account.dto.out.UserAccountOut;
import com.E205.cocos_forest.api.finance.account.service.AccountService;
import com.E205.cocos_forest.api.user.myprofile.dto.MyProfileResponseDto;
import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import com.E205.cocos_forest.global.exception.BaseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyProfileService {

    private final UserRepository userRepository;
    private final AccountService accountService;

    public MyProfileResponseDto getMyProfile(Long userId) {
        try {
            // 1. 사용자 정보 조회
            User user = userRepository.findById(userId)
                            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

            // 2. 연결된 계좌 정보 조회 - 분리된 api가 이미 연결되었으므로 주석처리
            // List<MyProfileResponseDto.ConnectedAccountDto> connectedAccounts = getConnectedAccounts(userId);

            // 3. 응답 DTO 생성
            return MyProfileResponseDto.builder()
                            .nickname(user.getNickname())
                            .currentBalance(user.getCurrentBalance())
                            .build();

        } catch (BaseException e) {
            log.error("마이페이지 조회 실패 - userId: {}, error: {}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("마이페이지 조회 중 예상치 못한 오류 발생 - userId: {}", userId, e);
            throw new BaseException(BaseResponseStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    private List<MyProfileResponseDto.ConnectedAccountDto> getConnectedAccounts(Long userId) {
//        try {
//            // AccountService의 getUserAccounts 메서드 사용
//            List<UserAccountOut> userAccounts = accountService.getUserAccounts(userId);
//
//            return userAccounts.stream()
//                            .map(account -> MyProfileResponseDto.ConnectedAccountDto.builder()
//                                            .accountNo(account.getAccountNo())
//                                            .bankCode(account.getBankCode())
//                                            .bankName(account.getBankName()) // 은행명 필드 추가
//                                            .build())
//                            .collect(Collectors.toList());
//
//        } catch (Exception e) {
//            log.warn("계좌 정보 조회 실패 - userId: {}, error: {}", userId, e.getMessage());
//            throw new BaseException(BaseResponseStatus.ACCOUNT_FETCH_FAILED);
//        }
//    }
}
