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

    public AnalysisResponseDto analyzeReport(Long userId, AnalysisRequestDto reportDto) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        saveTransactions(user, reportDto.getTransactions());
        
        Double carbonTotalKg = reportDto.getTotals().getCarbonTotalKg();
        if (carbonTotalKg == null) {
            throw new BaseException(BaseResponseStatus.INVALID_INPUT_VALUE, "carbonTotalKg 값이 누락되었습니다.");
        }

        String prompt = buildAdvicePrompt(carbonTotalKg);

        GenerativeModel model = new GenerativeModel(modelName, vertexAI);
        GenerateContentResponse response = model.generateContent(prompt);
        String aiResponseText = ResponseHandler.getText(response);

        AiApiResponse aiApiResponse = parseAiResponse(aiResponseText);
        if (aiApiResponse == null || aiApiResponse.getAdvice() == null) {
            log.error("AI가 유효하지 않은 형식의 JSON을 반환했습니다. 응답: {}", aiResponseText);
            throw new BaseException(BaseResponseStatus.AI_RESPONSE_ERROR);
        }

        String aiAdvice = aiApiResponse.getAdvice();
        Double totalCarbonEmissionsGrams = carbonTotalKg * 1000;
        LocalDate targetDate = LocalDate.now();

        // --- [로직 수정 시작] ---

        // 1. 해당 날짜에 이미 분석 데이터가 있는지 조회
        Optional<DailyCarbonFootprint> existingFootprintOpt =
            dailyCarbonFootprintRepository.findByUserIdAndTargetDate(userId, targetDate);

        DailyCarbonFootprint footprint;
        if (existingFootprintOpt.isPresent()) {
            // 2-1. 데이터가 있으면 기존 엔티티의 내용을 갱신 (UPDATE)
            footprint = existingFootprintOpt.get();
            footprint.updateAnalysis(totalCarbonEmissionsGrams, aiAdvice);
        } else {
            // 2-2. 데이터가 없으면 새로운 엔티티를 생성 (INSERT)
            footprint = DailyCarbonFootprint.builder()
                .user(user)
                .targetDate(targetDate)
                .totalCarbonEmissions(totalCarbonEmissionsGrams)
                .aiAdvice(aiAdvice)
                .build();
        }
        
        dailyCarbonFootprintRepository.save(footprint);
        
        return new AnalysisResponseDto(footprint);
    }

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
    
    private String buildAdvicePrompt(Double carbonTotalKg) {
        return String.format("""
            당신은 'coco's forest' 서비스의 친절하고 격려하는 환경 분석가입니다.
            사용자의 하루 총 탄소 배출량(kg) 데이터를 받고, 긍정적인 조언을 생성하는 역할을 합니다.
            결과는 반드시 지정된 JSON 형식으로만 응답해야 합니다. 다른 설명은 절대 추가하지 마세요.

            [사용자 하루 총 탄소 배출량]
            %.2f kg

            [요청 작업]
            1. 주어진 총량을 한국인 1일 평균 탄소 배출량인 32.6kg과 비교해주세요.
            2. 분석 결과를 바탕으로, 사용자가 기분 나쁘지 않도록 격려와 칭찬을 담아 간단하고 실용적인 조언을 생성해주세요.
            
            [응답 JSON 형식 - 중요!]
            JSON 키 이름은 반드시 "advice" 이어야 합니다. 절대로 다른 형식을 사용하지 마세요.
            {
              "advice": "[AI가 생성한 조언(문자열)]"
            }
            """, carbonTotalKg);
    }

    private AiApiResponse parseAiResponse(String jsonString) {
        try {
            String cleanJson = jsonString.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(cleanJson, AiApiResponse.class);
        } catch (IOException e) {
            log.error("AI 응답 JSON 파싱 실패: {}", jsonString, e);
            throw new BaseException(BaseResponseStatus.INVALID_JSON_FORMAT);
        }
    }

    @Getter
    private static class AiApiResponse {
        private String advice;
    }
}