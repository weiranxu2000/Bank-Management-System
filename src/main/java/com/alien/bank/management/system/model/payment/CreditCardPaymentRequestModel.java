package com.alien.bank.management.system.model.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCardPaymentRequestModel {
    
    @NotBlank(message = "信用卡号不能为空")
    @Pattern(regexp = "^\\d{19}$", message = "信用卡号必须是19位数字")
    private String creditCardNumber;
    
    @Min(value = 0, message = "还款金额必须大于0")
    private Double paymentAmount;
    
    // 可选：指定从哪张储蓄卡还款
    private String sourceDebitCardNumber;
    
    // 如果不指定储蓄卡，则表示现金还款
    private String paymentMethod; // "DEBIT_CARD" 或 "CASH"
}