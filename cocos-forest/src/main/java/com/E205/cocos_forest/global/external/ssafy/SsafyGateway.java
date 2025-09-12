// global/external/ssafy/SsafyGateway.java
package com.E205.cocos_forest.global.external.ssafy;

public interface SsafyGateway {
    // SSAFY에 사용자 등록(또는 조회) 호출, userKey 반환
    String registerAndGetUserKey(String userEmail);
    
    // SSAFY에서 사용자 검색, 존재 여부 확인
    boolean searchUser(String userEmail);
}
