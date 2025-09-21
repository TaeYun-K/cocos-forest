package com.E205.cocos_forest.domain.ai.entity;

import com.E205.cocos_forest.domain.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "transactions")
@Getter
@NoArgsConstructor
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "item_name", nullable = false) private String itemName;
    @Column(nullable = false) private Integer amount;
    @Column(length = 50, nullable = false) private String category;
    @Column(name = "transaction_at", nullable = false) private LocalDateTime transactionAt;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    @Builder
    public Transaction(User user, String itemName, Integer amount, String category, LocalDateTime transactionAt) {
        this.user = user;
        this.itemName = itemName;
        this.amount = amount;
        this.category = category;
        this.transactionAt = transactionAt;
        this.createdAt = LocalDateTime.now();
    }
}