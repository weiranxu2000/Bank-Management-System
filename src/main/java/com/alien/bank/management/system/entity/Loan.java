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
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "loan_application_id", referencedColumnName = "id")
    private LoanApplication loanApplication;

    @Column(nullable = false)
    private Double principalAmount; // 本金

    @Column(nullable = false)
    private Double outstandingBalance; // 剩余欠款

    @Column(nullable = false)
    private Double monthlyPayment; // 月还款额

    @Column(nullable = false)
    private Double interestRate; // 年利率

    @Column(nullable = false)
    private Integer totalTermMonths; // 总期数

    @Column(nullable = false)
    private Integer remainingTerms; // 剩余期数

    @Column
    private Date nextPaymentDate; // 下次还款日期

    @Column
    private Date lastPaymentDate; // 最后还款日期

    @Column
    @Builder.Default
    private Boolean isActive = true;

    @Column
    private Date createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }
}