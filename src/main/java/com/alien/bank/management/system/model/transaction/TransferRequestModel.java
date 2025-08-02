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
public class TransferRequestModel {

    @NotNull(message = "源卡号不能为空")
    private String from_card_number;

    @NotNull(message = "目标卡号不能为空")
    private String to_card_number;

    @NotNull(message = "密码不能为空")
    @Pattern(regexp = "^\\d{6}$", message = "密码必须是6位数字")
    private String password;

    @NotNull(message = "转账金额不能为空")
    @Min(value = 1, message = "转账金额不能小于1元")
    private Double amount;

    private String notes; // 转账备注
}