package com.alien.bank.management.system.model.application;

import com.alien.bank.management.system.entity.CardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardApplicationRequestModel {
    
    @NotBlank(message = "银行卡密码不能为空")
    @Pattern(regexp = "^\\d{6}$", message = "密码必须是6位数字")
    private String preferredPassword;

    @NotNull(message = "卡片类型不能为空")
    private CardType cardType;

    private Double requestedCreditLimit; // 申请的信用额度（仅信用卡需要）
    
    @Size(max = 500, message = "申请原因不能超过500字符")
    private String applicationReason;
}