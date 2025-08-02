package com.alien.bank.management.system.model.loan;

import com.alien.bank.management.system.entity.ApplicationStatus;
import jakarta.validation.constraints.Min;
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
public class ProcessLoanApplicationRequestModel {
    
    @NotNull(message = "处理状态不能为空")
    private ApplicationStatus status;
    
    @Min(value = 0, message = "批准金额不能为负数")
    private Double approvedAmount;
    
    @Min(value = 1, message = "利率必须大于0")
    private Double interestRate;
    
    @Size(max = 500, message = "管理员备注不能超过500字符")
    private String adminNotes;
}