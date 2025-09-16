package com.E205.cocos_forest.domain.finance.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor
public class Category {

    @Id
    @Column(name = "category_id", length = 32)
    private String categoryId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;
}
