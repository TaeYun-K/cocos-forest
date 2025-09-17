package com.E205.cocos_forest.domain.finance.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByCategoryIdIn(Collection<String> categoryIds);
}
