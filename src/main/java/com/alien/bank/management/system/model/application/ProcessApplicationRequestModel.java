package com.alien.bank.management.system.model.application;

import com.alien.bank.management.system.entity.ApplicationStatus;
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
public class ProcessApplicationRequestModel {
    
    @NotNull(message = "处理状态不能为空")
    private ApplicationStatus status;
    
    @Size(max = 500, message = "管理员备注不能超过500字符")
    private String adminNotes;
}