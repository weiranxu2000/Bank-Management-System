package com.alien.bank.management.system.service;

import com.alien.bank.management.system.model.password.ChangePasswordRequestModel;
import com.alien.bank.management.system.model.password.ForgotPasswordRequestModel;
import com.alien.bank.management.system.model.password.VerifyCodeRequestModel;

public interface PasswordManagementService {
    
    // 修改密码（需要原密码）
    void changePassword(ChangePasswordRequestModel request);
    
    // 忘记密码 - 发送验证码
    String sendVerificationCode(ForgotPasswordRequestModel request);
    
    // 验证验证码并重置密码
    void verifyCodeAndResetPassword(VerifyCodeRequestModel request);
    
    // 清理过期的重置请求
    void cleanExpiredResetRequests();
}