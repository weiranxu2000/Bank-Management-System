package com.alien.bank.management.system.model.application;

import com.alien.bank.management.system.entity.ApplicationStatus;
import com.alien.bank.management.system.entity.CardType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardApplicationResponseModel {
    private Long id;
    private String userName;
    private String userEmail;
    private String userPhone;
    private CardType cardType;
    private Double requestedCreditLimit;
    private String applicationReason;
    private ApplicationStatus status;
    private Date applicationDate;
    private Date processedDate;
    private String processedByName;
    private String adminNotes;
    private String generatedCardNumber;
}