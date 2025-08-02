package com.alien.bank.management.system.model.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAccountResponseModel {
    private Long id;
    private String cardNumber;
    private Double balance;
    private Boolean isActive;
    private Date createdAt;
    private String userName;
    private String userEmail;
    private Integer transactionCount;
}