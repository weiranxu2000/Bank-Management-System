package com.alien.bank.management.system.model.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemStatisticsModel {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalAccounts;
    private Long activeAccounts;
    private Long totalTransactions;
    private Double totalBalance;
    private Double todayTransactionAmount;
    private Long todayTransactionCount;
    private Double totalTransferFees;
}