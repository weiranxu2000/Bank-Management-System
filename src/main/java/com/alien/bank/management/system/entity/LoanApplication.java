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
public class LoanApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false)
    private Double requestedAmount; // 申请金额

    @Column(nullable = false)
    private Integer loanTermMonths; // 贷款期限（月）

    @Column(length = 500)
    private String loanPurpose; // 贷款用途

    @Column
    private Double monthlyIncome; // 月收入

    @Column
    private Double existingDebt; // 现有债务

    @Column
    private Double calculatedCreditScore; // 计算的信用评分

    @Column
    private Double approvedAmount; // 批准金额

    @Column
    private Double monthlyPayment; // 月还款额

    @Column
    private Double interestRate; // 利率

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column
    private Date applicationDate;

    @Column
    private Date processedDate;

    @ManyToOne
    @JoinColumn(name = "processed_by", referencedColumnName = "id")
    private User processedBy;

    @Column(length = 500)
    private String adminNotes;

    @PrePersist
    protected void onCreate() {
        applicationDate = new Date();
    }
}