package com.E205.cocos_forest.global.external.clova;

import org.springframework.stereotype.Component;

import java.io.BufferedInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * 임시 Stub: 실제 Clova OCR 연동 전까지는 업로드된 바이너리를 텍스트로 간주하고
 * UTF-8 로 변환해 반환합니다. 실제 영수증 사진에서는 무의미하므로 항상 실패로
 * 해석될 수 있습니다. 통합 시 실제 HTTP 호출로 교체하세요.
 */
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "app.clova.ocr.stub", havingValue = "true", matchIfMissing = false)
@Component
public class ClovaOcrStubClient implements ClovaOcrClient {
    @Override
    public OcrResult recognize(InputStream imageStream, String contentType) throws Exception {
        // 주의: 실제 이미지에 대해선 의미가 없으며, 통합 전 테스트용입니다.
        try (BufferedInputStream bis = new BufferedInputStream(imageStream)) {
            byte[] bytes = bis.readAllBytes();
            String txt = new String(bytes, StandardCharsets.UTF_8);
            return new OcrResult(txt);
        }
    }
}
