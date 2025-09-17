package com.E205.cocos_forest.global.external.ssafy.client.api;

public interface MemberClient {
    String registerAndGetUserKey(String userEmail);
    boolean searchUser(String userEmail);
}
