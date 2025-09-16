package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardProductOut;
import com.E205.cocos_forest.domain.finance.card.CardProduct;
import com.E205.cocos_forest.domain.finance.card.CardProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardProductServiceImpl implements CardProductService {

    private final CardProductRepository repository;

    @Override
    public List<CardProductOut> getAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(CardProduct::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toOut)
                .toList();
    }

    private CardProductOut toOut(CardProduct e) {
        return CardProductOut.builder()
                .productId(e.getProductId())
                .issuerCode(e.getIssuerCode())
                .cardUniqueNo(e.getCardUniqueNo())
                .name(e.getName())
                .description(e.getDescription())
                .baselinePerformance(e.getBaselinePerformance())
                .maxBenefitLimit(e.getMaxBenefitLimit())
                .build();
    }
}
