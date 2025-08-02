package com.alien.bank.management.system.model.loan;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplicationRequestModel {
    
    @NotNull(message = "申请金额不能为空")
    @Min(value = 1000, message = "申请金额至少1000元")
    private Double requestedAmount;
    
    @NotNull(message = "贷款期限不能为空")
    @Min(value = 6, message = "贷款期限至少6个月")
    private Integer loanTermMonths;
    
    @NotBlank(message = "贷款用途不能为空")
    @Size(max = 500, message = "贷款用途不能超过500字符")
    private String loanPurpose;
    
    @NotNull(message = "月收入不能为空")
    @Min(value = 0, message = "月收入不能为负数")
    private Double monthlyIncome;
    
    @Min(value = 0, message = "现有债务不能为负数")
    private Double existingDebt;
}