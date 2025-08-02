package com.alien.bank.management.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 25)
    private String cardNumber;

    @Column(nullable = false, length = 6)
    private String password;

    @Column(nullable = false)
    private Double balance;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CardType cardType = CardType.DEBIT;

    // 信用卡专用字段
    @Column
    private String cvv; // 信用卡CVV码

    @Column
    private Double creditLimit; // 信用额度

    @Column
    @Builder.Default
    private Double availableCredit = 0.0; // 可用额度

    @Column
    private Date lastPaymentDate; // 最后还款日期

    @Column
    @Builder.Default
    private Double outstandingBalance = 0.0; // 欠款余额

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
