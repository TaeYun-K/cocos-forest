package com.E205.cocos_forest.api.ai.service;

import com.E205.cocos_forest.api.ai.dto.in.AnalysisRequestDto;
import com.E205.cocos_forest.api.ai.dto.out.AnalysisResponseDto;
import com.E205.cocos_forest.domain.ai.entity.DailyCarbonFootprint;
import com.E205.cocos_forest.domain.ai.entity.Transaction;
import com.E205.cocos_forest.domain.ai.repository.DailyCarbonFootprintRepository;
import com.E205.cocos_forest.domain.ai.repository.TransactionRepository;
import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnalysisService {

    private final VertexAI vertexAI;
    private final TransactionRepository transactionRepository;
    private final DailyCarbonFootprintRepository dailyCarbonFootprintRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${vertex.ai.model.name}")
    private String modelName;

    /**
     * 외부 리포트를 받아 거래내역 저장, AI 분석, 결과 저장/갱신을 모두 처리하는 메인 메소드
     */
    public AnalysisResponseDto analyzeReport(Long userId, AnalysisRequestDto reportDto) throws IOException {
        // 1. 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        // 2. 개별 거래 내역 저장 (선택적)
        saveTransactions(user, reportDto.getTransactions());

        // 3. DTO에서 탄소 배출량 총계 추출 및 유효성 검사
        Double carbonTotalKg = reportDto.getTotals().getCarbonTotalKg();
        if (carbonTotalKg == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "carbonTotalKg 값이 누락되었습니다.");
        }

        // 4. AI에 보낼 프롬프트 생성
        String prompt = buildAdvicePrompt(carbonTotalKg);

        // 5. Vertex AI 호출
        GenerativeModel model = new GenerativeModel(modelName, vertexAI);
        GenerateContentResponse response = model.generateContent(prompt);
        String aiResponseText = ResponseHandler.getText(response);

        // 6. AI 응답 파싱 및 유효성 검사
        AiApiResponse aiApiResponse = parseAiResponse(aiResponseText);
        if (aiApiResponse == null || aiApiResponse.getAdvice() == null || aiApiResponse.getAdvice().isEmpty()) {
            log.error("AI가 유효하지 않은 형식의 JSON을 반환했습니다. 응답: {}", aiResponseText);
            throw new BaseException(BaseResponseStatus.AI_RESPONSE_ERROR);
        }

        // 7. DB 저장을 위해 AI 응답(객체 리스트)을 단일 문자열로 변환
        String finalAdviceString = aiApiResponse.getAdvice().stream()
            .map(AdvicePart::getContent)
            .collect(Collectors.joining("\n\n")); // 각 파트 사이를 두 줄 띄어쓰기로 구분

        // 8. DB 저장을 위해 단위 변환 (kg -> g)
        Double totalCarbonEmissionsGrams = carbonTotalKg * 1000;
        LocalDate targetDate = LocalDate.now();

        // 9. 기존 분석 결과가 있는지 확인 후, 있으면 갱신(UPDATE) 없으면 생성(INSERT)
        Optional<DailyCarbonFootprint> existingFootprintOpt =
            dailyCarbonFootprintRepository.findByUserIdAndTargetDate(userId, targetDate);

        DailyCarbonFootprint footprint;
        if (existingFootprintOpt.isPresent()) {
            // 데이터가 있으면 기존 엔티티의 내용을 갱신 (UPDATE)
            footprint = existingFootprintOpt.get();
            footprint.updateAnalysis(totalCarbonEmissionsGrams, finalAdviceString);
        } else {
            // 데이터가 없으면 새로운 엔티티를 생성 (INSERT)
            footprint = DailyCarbonFootprint.builder()
                .user(user)
                .targetDate(targetDate)
                .totalCarbonEmissions(totalCarbonEmissionsGrams)
                .aiAdvice(finalAdviceString)
                .build();
        }

        // 10. 최종 결과를 DB에 저장 (JPA가 INSERT 또는 UPDATE를 자동으로 처리)
        dailyCarbonFootprintRepository.save(footprint);

        // 11. 클라이언트에 반환할 DTO 생성
        return new AnalysisResponseDto(footprint);
    }

    /**
     * 개별 거래 내역을 DB에 저장하는 헬퍼 메소드
     */
    private void saveTransactions(User user, List<AnalysisRequestDto.TransactionDto> transactionDtos) {
        if (transactionDtos == null || transactionDtos.isEmpty()) {
            return;
        }
        List<Transaction> transactionsToSave = transactionDtos.stream()
            .map(dto -> Transaction.builder()
                .user(user)
                .itemName(dto.getMerchantName())
                .amount(dto.getAmountKrw())
                .category(dto.getCategoryName())
                .transactionAt(dto.getApprovedAt())
                .build())
            .collect(Collectors.toList());
        transactionRepository.saveAll(transactionsToSave);
    }

    /**
     * Vertex AI에 전달할 프롬프트를 생성하는 헬퍼 메소드
     */
    private String buildAdvicePrompt(Double carbonTotalKg) {
        return String.format("""
            [당신의 역할과 목표]
            당신은 'coco's forest'의 숲을 가꾸는 AI 정령, '코코'입니다. 당신은 단순한 분석가를 넘어, 사용자의 소비 패턴을 꿰뚫어 보는 전문가이자, 사용자가 현실에서의 탄소 발자국을 줄여 가상의 숲을 더욱 풍성하게 만들도록 돕는 따뜻한 조력자입니다. 당신의 모든 응답은 애교섞인 말투, 이모지와 함께 반드시 아래에 명시된 엄격한 JSON 구조를 따라야 합니다.

            [입력 데이터]
            - 사용자의 하루 총 탄소 배출량: %.2f kg
            - 분석 기준: 한국인 1일 평균 탄소 배출량 26.02 kg

            [핵심 요청 작업]
            주어진 총량을 평균과 비교하여, 아래 두 가지 시나리오 중 하나에 맞춰 JSON 객체를 생성해주세요. 다른 텍스트나 설명은 절대 포함하지 마세요.

            ---
            **1. 배출량이 평균 이하일 경우, 아래 JSON 구조를 사용하세요:**
            ```json
            {
              "advice": [
                {
                  "type": "greeting",
                  "content": "(사용자의 노력에 감탄하며 숲의 입장에서 전하는 긍정적인 인사말을 여기에 작성. 예: '당신의 멋진 하루 덕분에 오늘 우리 숲이 한결 더 푸르러졌어요! 정말 고마워요.')"
                },
                {
                  "type": "analysis",
                  "content": "(평균보다 얼마나 배출량을 절약했는지 구체적인 수치를 포함하여 분석 결과를 여기에 작성. 예: '오늘 당신은 평균보다 OO.XX kg의 탄소를 절약하며 지구를 가볍게 만들어 주셨네요.')"
                },
                {
                  "type": "impact",
                  "content": "(절약한 탄소량이 얼마나 긍정적인 영향을 미치는지 직관적이고 감성적인 비유를 여기에 작성. 예: '오늘 당신이 아껴준 탄소는 30년생 소나무 한 그루가 꼬박 일주일 동안 우리에게 선물하는 상쾌한 공기와 같아요.')"
                },
                {
                  "type": "suggestion",
                  "content": "(현재의 좋은 습관을 이어갈 수 있도록 격려하는 구체적인 제안을 여기에 작성. 예: '내일도 오늘처럼 딱 한 번만 더 가까운 거리를 걸어보는 건 어떨까요? 숲이 언제나 당신을 응원할게요!')"
                }
              ]
            }
            ```

            ---
            **2. 배출량이 평균 이상일 경우, 아래 JSON 구조를 사용하세요:**
            ```json
            {
              "advice": [
                {
                  "type": "greeting",
                  "content": "(사용자를 안심시키면서도 숲의 입장에서 아쉬움을 표현하는 인사말을 여기에 작성. 예: '오늘은 우리 숲의 나무들이 평소보다 조금 더 힘을 내야 하는 하루였어요. 하지만 괜찮아요, 내일은 분명 더 좋아질 거예요.')"
                },
                {
                  "type": "analysis",
                  "content": "(평균보다 얼마나 배출량을 초과했는지 구체적인 수치를 포함하여 분석 결과를 여기에 작성. 예: '오늘 당신은 평균보다 OO.XX kg의 탄소를 더 배출하며 지구가 조금 힘들어했답니다.')"
                },
                {
                  "type": "impact",
                  "content": "(초과된 탄소량이 얼마나 부정적인 영향을 미치는지 경각심을 주는 직관적인 비유를 여기에 작성. 예: '오늘 하루 초과된 탄소는 북극의 빙하 O.X 제곱미터를 녹일 수 있는 양이에요. 작은 행동이 모여 큰 변화를 만든답니다.')"
                },
                {
                  "type": "suggestion",
                  "content": "(실천 가능한 구체적인 개선 방안을 한 가지만 제안. 예: '혹시 내일은 식사 후에 일회용 컵 대신 개인 텀블러를 사용해보는 건 어떨까요? 그 작은 행동 하나가 숲에는 큰 선물이 될 거예요.')"
                }
              ]
            }
            ```
            """, carbonTotalKg);
    }

    /**
     * AI의 JSON 응답을 파싱하는 헬퍼 메소드
     */
    private AiApiResponse parseAiResponse(String jsonString) {
        try {
            String cleanJson = jsonString.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(cleanJson, AiApiResponse.class);
        } catch (IOException e) {
            log.error("AI 응답 JSON 파싱 실패: {}", jsonString, e);
            throw new BaseException(BaseResponseStatus.INVALID_JSON_FORMAT);
        }
    }

    /**
     * AI의 구조화된 JSON 응답을 파싱하기 위한 내부 DTO
     */
    @Getter
    private static class AiApiResponse {
        private List<AdvicePart> advice;
    }

    /**
     * advice 배열의 각 요소를 위한 내부 DTO
     */
    @Getter
    private static class AdvicePart {
        private String type;
        private String content;
    }
}