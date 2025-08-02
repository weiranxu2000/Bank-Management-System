package com.alien.bank.management.system.model.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferResponseModel {
    private Long transfer_id;
    private String from_card_number;
    private String to_card_number;
    private Double amount;
    private Double transfer_fee;
    private Double from_balance_after;
    private String notes;
    private String timestamp;
}