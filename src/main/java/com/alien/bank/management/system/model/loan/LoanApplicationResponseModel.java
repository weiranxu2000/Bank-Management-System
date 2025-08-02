package com.alien.bank.management.system.model.loan;

import com.alien.bank.management.system.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplicationResponseModel {
    private Long id;
    private String userName;
    private String userEmail;
    private Double requestedAmount;
    private Integer loanTermMonths;
    private String loanPurpose;
    private Double monthlyIncome;
    private Double existingDebt;
    private Double calculatedCreditScore;
    private Double approvedAmount;
    private Double monthlyPayment;
    private Double interestRate;
    private ApplicationStatus status;
    private Date applicationDate;
    private Date processedDate;
    private String processedByName;
    private String adminNotes;
}