package com.alien.bank.management.system.model.transaction;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawRequestModel {

    @NotNull(message = "Card number is required")
    private String card_number;

    @NotNull(message = "Password is required")
    @Pattern(regexp = "^\\d{6}$", message = "Password must be exactly 6 digits")
    private String password;

    private String notes; // 可选备注

    @NotNull(message = "Amount is required")
    @Min(value = 0, message = "Amount can't be negative")
    private Double amount;
}