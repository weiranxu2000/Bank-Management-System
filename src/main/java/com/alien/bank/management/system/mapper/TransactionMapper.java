package com.alien.bank.management.system.mapper;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.Transaction;
import com.alien.bank.management.system.entity.TransactionType;
import com.alien.bank.management.system.model.transaction.DepositRequestModel;
import com.alien.bank.management.system.model.transaction.TransactionHistoryResponseModel;
import com.alien.bank.management.system.model.transaction.TransactionResponseModel;

import java.util.List;

public interface TransactionMapper {
    Transaction toEntity(double amount, Account account, TransactionType type);
    Transaction toEntity(double amount, Account account, TransactionType type, String notes);
    TransactionResponseModel toResponseModel(Long id, double amount, double balance);
    TransactionHistoryResponseModel toHistoryResponseModel(Transaction transaction);
    List<TransactionHistoryResponseModel> toHistoryResponseModelList(List<Transaction> transactions);
}
