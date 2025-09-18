package com.E205.cocos_forest.global.external.ssafy.dto;

import com.E205.cocos_forest.global.external.ssafy.header.SsafyHeader;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SsafyRequest<T> {
    private SsafyHeader header;
    private T body;
}
