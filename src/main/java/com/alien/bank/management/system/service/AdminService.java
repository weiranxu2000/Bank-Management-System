package com.alien.bank.management.system.service;

import com.alien.bank.management.system.model.admin.AdminUserResponseModel;
import com.alien.bank.management.system.model.admin.AdminAccountResponseModel;
import com.alien.bank.management.system.model.admin.SystemStatisticsModel;
import com.alien.bank.management.system.model.application.CardApplicationResponseModel;
import com.alien.bank.management.system.model.transaction.TransactionHistoryResponseModel;

import java.util.List;

public interface AdminService {
    
    // 用户管理
    List<AdminUserResponseModel> getAllUsers();
    AdminUserResponseModel freezeUser(Long userId);
    AdminUserResponseModel unfreezeUser(Long userId);
    
    // 账户管理
    List<AdminAccountResponseModel> getAllAccounts();
    AdminAccountResponseModel freezeAccount(Long accountId);
    AdminAccountResponseModel unfreezeAccount(Long accountId);
    
    // 交易管理
    List<TransactionHistoryResponseModel> getAllTransactions();
    
    // 系统统计
    SystemStatisticsModel getSystemStatistics();
    
    // 申请管理
    List<CardApplicationResponseModel> getAllApplications();
    List<CardApplicationResponseModel> getPendingApplications();
}