package com.E205.cocos_forest.global.external.clova;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;
import io.netty.channel.ConnectTimeoutException;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Iterator;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;

/**
 * 실제 Clova OCR 연동 구현 (JSON/Base64 방식)
 */
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "app.clova.ocr.stub", havingValue = "false", matchIfMissing = true)
@Component
@RequiredArgsConstructor
@Slf4j
public class ClovaOcrWebClient implements ClovaOcrClient {

    private final WebClient.Builder webClientBuilder;
    private final ClovaProperties props;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public OcrResult recognize(InputStream imageStream, String contentType) throws Exception {
        if (!StringUtils.hasText(props.getBaseUrl()) || !StringUtils.hasText(props.getSecretKey())) {
            throw new IllegalStateException("Clova OCR properties not configured");
        }
        if (Boolean.TRUE.equals(props.getRequireHttps()) && props.getBaseUrl().startsWith("http://")) {
            throw new IllegalStateException("Clova OCR base-url must use HTTPS: " + props.getBaseUrl());
        }

        // 1) 이미지 -> Base64
        byte[] bytes = imageStream.readAllBytes();
        String b64 = Base64.getEncoder().encodeToString(bytes);

        String format = guessFormat(contentType);

        // 2) 요청 JSON (V2 포맷 예시)
        ObjectNode root = mapper.createObjectNode();
        root.put("version", props.getVersion());
        root.put("requestId", UUID.randomUUID().toString());
        root.put("timestamp", System.currentTimeMillis());
        if (props.getLang() != null) root.put("lang", props.getLang());

        ArrayNode images = mapper.createArrayNode();
        ObjectNode img = mapper.createObjectNode();
        img.put("format", format);
        img.put("name", props.getImageName());
        img.put("data", b64);
        images.add(img);
        root.set("images", images);

        if (props.getTemplateIds() != null && !props.getTemplateIds().isEmpty()) {
            ArrayNode tids = mapper.createArrayNode();
            for (String id : props.getTemplateIds()) {
                tids.add(id);
            }
            root.set("templateIds", tids);
        }

        String requestJson = mapper.writeValueAsString(root);

        HttpClient httpClient = HttpClient.create()
            .compress(true)
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, props.getConnectTimeoutMs())
            .responseTimeout(Duration.ofMillis(props.getReadTimeoutMs()))
            .doOnConnected(conn -> conn
                .addHandlerLast(new ReadTimeoutHandler(props.getReadTimeoutMs(), TimeUnit.MILLISECONDS))
                .addHandlerLast(new WriteTimeoutHandler(props.getReadTimeoutMs(), TimeUnit.MILLISECONDS))
            );

        WebClient client = webClientBuilder.clone()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .baseUrl(props.getBaseUrl())
            .build();

        String response = client.post()
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .header("X-OCR-SECRET", props.getSecretKey())
            .bodyValue(requestJson)
            .retrieve()
            .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(), resp ->
                resp.bodyToMono(String.class).defaultIfEmpty("")
                    .flatMap(body -> {
                        log.warn("Clova OCR HTTP {} with body: {}", resp.statusCode(), body);
                        return Mono.error(new RuntimeException("Clova OCR error: " + resp.statusCode() + " " + body));
                    })
            )
            .bodyToMono(String.class)
            .retryWhen(Retry.backoff(Math.max(0, props.getMaxRetries()), Duration.ofMillis(Math.max(0L, props.getRetryBackoffMs())))
                .filter(ex -> ex instanceof TimeoutException
                    || ex instanceof ConnectTimeoutException
                    || ex.getCause() instanceof ConnectTimeoutException))
            .timeout(Duration.ofMillis(props.getReadTimeoutMs() + 2000L))
            .onErrorResume(e -> {
                String msg = e.toString();
                if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException ex) {
                    msg = ex.getStatusCode() + " " + ex.getResponseBodyAsString();
                }
                log.warn("Clova OCR call failed: {} (url={})", msg, props.getBaseUrl());
                return Mono.error(e);
            })
            .block();

        String fullText = extractTextSafe(response);
        return new OcrResult(fullText);
    }

    private String guessFormat(String contentType) {
        if (contentType == null) return "jpg";
        if (contentType.contains("png")) return "png";
        if (contentType.contains("jpeg") || contentType.contains("jpg")) return "jpg";
        return "jpg";
    }

    private String extractTextSafe(String json) {
        if (!StringUtils.hasText(json)) return "";
        try {
            JsonNode root = mapper.readTree(json.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();

            // 일반 구조: images[*].fields[*].inferText
            JsonNode images = root.path("images");
            if (images.isArray()) {
                for (JsonNode img : images) {
                    JsonNode fields = img.path("fields");
                    if (fields.isArray()) {
                        for (JsonNode f : fields) {
                            String t = f.path("inferText").asText("");
                            if (StringUtils.hasText(t)) sb.append(t).append('\n');
                        }
                    }
                    // 다른 구조 대비: paragraphs/lines/words 등에서 text/inferText 수집
                    collectKeyRecursively(img, sb, "text");
                    collectKeyRecursively(img, sb, "inferText");
                }
            } else {
                collectKeyRecursively(root, sb, "text");
                collectKeyRecursively(root, sb, "inferText");
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("OCR response parse failed: {}", e.toString());
            return "";
        }
    }

    private void collectKeyRecursively(JsonNode node, StringBuilder out, String key) {
        if (node == null) return;
        if (node.has(key)) {
            String val = node.get(key).asText("");
            if (StringUtils.hasText(val)) out.append(val).append('\n');
        }
        if (node.isContainerNode()) {
            Iterator<JsonNode> it = node.elements();
            while (it.hasNext()) collectKeyRecursively(it.next(), out, key);
        }
    }
}
