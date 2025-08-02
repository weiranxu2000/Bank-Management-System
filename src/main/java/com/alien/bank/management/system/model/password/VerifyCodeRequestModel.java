package com.alien.bank.management.system.model.password;

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
public class VerifyCodeRequestModel {
    
    @NotBlank(message = "银行卡号不能为空")
    @Pattern(regexp = "^\\d{19}$", message = "银行卡号必须是19位数字")
    private String cardNumber;
    
    @NotBlank(message = "验证码不能为空")
    @Pattern(regexp = "^\\d{6}$", message = "验证码必须是6位数字")
    private String verificationCode;
}