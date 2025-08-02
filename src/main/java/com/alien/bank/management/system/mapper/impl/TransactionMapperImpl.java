package com.alien.bank.management.system.mapper.impl;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.Transaction;
import com.alien.bank.management.system.entity.TransactionType;
import com.alien.bank.management.system.mapper.TransactionMapper;
import com.alien.bank.management.system.model.transaction.DepositRequestModel;
import com.alien.bank.management.system.model.transaction.TransactionHistoryResponseModel;
import com.alien.bank.management.system.model.transaction.TransactionResponseModel;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TransactionMapperImpl implements TransactionMapper {

    @Override
    public Transaction toEntity(double amount, Account account, TransactionType type) {
        return Transaction
                .builder()
                .amount(amount)
                .account(account)
                .type(type)
                .timestamp(new Date())
                .notes("Account Balance" + account.getBalance())
                .build();
    }

    @Override
    public Transaction toEntity(double amount, Account account, TransactionType type, String notes) {
        // 如果没有提供备注，生成默认的中文备注
        if (notes == null || notes.trim().isEmpty()) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy年MM月dd日 HH:mm");
            String operation = type == TransactionType.DEPOSIT ? "存款" : "取款";
            notes = sdf.format(new Date()) + " " + operation + " " + amount + "元";
        }
        
        return Transaction
                .builder()
                .amount(amount)
                .account(account)
                .type(type)
                .timestamp(new Date())
                .notes(notes)
                .build();
    }

    @Override
    public TransactionResponseModel toResponseModel(Long id, double amount, double balance) {
        return TransactionResponseModel
                .builder()
                .id(id)
                .amount(amount)
                .balance(balance)
                .build();
    }

    @Override
    public TransactionHistoryResponseModel toHistoryResponseModel(Transaction transaction) {
        return TransactionHistoryResponseModel
                .builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .notes(transaction.getNotes())
                .timestamp(transaction.getTimestamp())
                .card_number(transaction.getAccount().getCardNumber())
                .balance_after(transaction.getAccount().getBalance())
                .build();
    }

    @Override
    public List<TransactionHistoryResponseModel> toHistoryResponseModelList(List<Transaction> transactions) {
        return transactions.stream()
                .map(this::toHistoryResponseModel)
                .collect(Collectors.toList());
    }
}
