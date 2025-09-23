package com.E205.cocos_forest.global.external.clova;

import java.io.InputStream;
import lombok.Getter;

/**
 * Clova OCR 연동 클라이언트 (스트리밍 입력 지원)
 * 실제 HTTP 호출 구현은 후속 통합 시 추가합니다.
 */
public interface ClovaOcrClient {

    /**
     * 이미지 스트림을 OCR에 전달하고 인식된 전체 텍스트를 반환합니다.
     * 구현체는 호출 후 스트림을 닫지 않아야 합니다.
     */
    OcrResult recognize(InputStream imageStream, String contentType) throws Exception;

    @Getter
    class OcrResult {
        private final String fullText; // OCR 결과 전체 텍스트(줄바꿈 포함 가능)

        public OcrResult(String fullText) {
            this.fullText = fullText == null ? "" : fullText;
        }

    }
}

