package com.alien.bank.management.system.model.transaction;

import com.alien.bank.management.system.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionHistoryResponseModel {
    private Long id;
    private TransactionType type;
    private Double amount;
    private String notes;
    private Date timestamp;
    private String card_number;
    private Double balance_after;
}