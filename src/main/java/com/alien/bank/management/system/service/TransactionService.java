package com.alien.bank.management.system.service;

import com.alien.bank.management.system.model.transaction.DepositRequestModel;
import com.alien.bank.management.system.model.transaction.TransactionHistoryResponseModel;
import com.alien.bank.management.system.model.transaction.TransactionResponseModel;
import com.alien.bank.management.system.model.transaction.TransferRequestModel;
import com.alien.bank.management.system.model.transaction.TransferResponseModel;
import com.alien.bank.management.system.model.transaction.WithdrawRequestModel;

import java.util.List;

public interface TransactionService {
    TransactionResponseModel deposit(DepositRequestModel request);
    TransactionResponseModel withdraw(WithdrawRequestModel request);
    TransferResponseModel transfer(TransferRequestModel request);
    
    // 获取用户的所有交易历史
    List<TransactionHistoryResponseModel> getUserTransactionHistory();
    
    // 获取指定账户的交易历史
    List<TransactionHistoryResponseModel> getAccountTransactionHistory(Long accountId);
}