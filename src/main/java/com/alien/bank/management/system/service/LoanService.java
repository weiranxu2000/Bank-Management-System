package com.alien.bank.management.system.service;

import com.alien.bank.management.system.model.loan.LoanApplicationRequestModel;
import com.alien.bank.management.system.model.loan.LoanApplicationResponseModel;
import com.alien.bank.management.system.model.loan.ProcessLoanApplicationRequestModel;

import java.util.List;

public interface LoanService {
    
    // 提交贷款申请
    LoanApplicationResponseModel submitLoanApplication(LoanApplicationRequestModel request);
    
    // 获取用户的贷款申请列表
    List<LoanApplicationResponseModel> getUserLoanApplications();
    
    // 管理员获取所有贷款申请
    List<LoanApplicationResponseModel> getAllLoanApplications();
    
    // 管理员获取待处理贷款申请
    List<LoanApplicationResponseModel> getPendingLoanApplications();
    
    // 管理员处理贷款申请
    LoanApplicationResponseModel processLoanApplication(Long applicationId, ProcessLoanApplicationRequestModel request);
    
    // 获取用户的活跃贷款
    List<Object> getUserActiveLoans();
    
    // 贷款还款
    void makeLoanPayment(Long loanId, Double amount);
    
    // 计算信用评分
    Double calculateCreditScore(Double monthlyIncome, Double existingDebt, Double requestedAmount);
}