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
public class CardApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false, length = 6)
    private String preferredPassword;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CardType cardType = CardType.DEBIT;

    @Column
    private Double requestedCreditLimit; // 申请的信用额度（仅信用卡）

    @Column(length = 500)
    private String applicationReason;

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

    @Column
    private String generatedCardNumber;

    @PrePersist
    protected void onCreate() {
        applicationDate = new Date();
    }
}