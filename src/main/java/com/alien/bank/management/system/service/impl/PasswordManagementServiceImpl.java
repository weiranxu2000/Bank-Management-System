package com.alien.bank.management.system.service.impl;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.PasswordResetRequest;
import com.alien.bank.management.system.entity.User;
import com.alien.bank.management.system.model.password.ChangePasswordRequestModel;
import com.alien.bank.management.system.model.password.ForgotPasswordRequestModel;
import com.alien.bank.management.system.model.password.VerifyCodeRequestModel;
import com.alien.bank.management.system.repository.AccountRepository;
import com.alien.bank.management.system.repository.PasswordResetRequestRepository;
import com.alien.bank.management.system.repository.UserRepository;
import com.alien.bank.management.system.service.PasswordManagementService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordManagementServiceImpl implements PasswordManagementService {

    private final AccountRepository accountRepository;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final UserRepository userRepository;

    @Override
    public void changePassword(ChangePasswordRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Account account = accountRepository.findByCardNumberAndPassword(
                request.getCardNumber(), request.getOldPassword())
                .orElseThrow(() -> new IllegalArgumentException("银行卡号或原密码错误"));

        // 验证账户属于当前用户
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("无权操作此银行卡");
        }

        account.setPassword(request.getNewPassword());
        accountRepository.save(account);
    }

    @Override
    public String sendVerificationCode(ForgotPasswordRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Account account = accountRepository.findByCardNumber(request.getCardNumber())
                .orElseThrow(() -> new EntityNotFoundException("银行卡不存在"));

        // 验证账户属于当前用户
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("无权操作此银行卡");
        }

        // 生成6位验证码
        String verificationCode = String.format("%06d", new Random().nextInt(1000000));

        // 保存重置请求
        PasswordResetRequest resetRequest = PasswordResetRequest.builder()
                .account(account)
                .verificationCode(verificationCode)
                .newPassword(request.getNewPassword())
                .isUsed(false)
                .build();

        passwordResetRequestRepository.save(resetRequest);

        // 模拟发送短信到用户手机
        String maskedPhone = maskPhoneNumber(user.getPhone());
        System.out.println("模拟发送验证码到手机: " + maskedPhone + ", 验证码: " + verificationCode);

        return "验证码已发送到您的手机 " + maskedPhone + "，10分钟内有效";
    }

    @Override
    public void verifyCodeAndResetPassword(VerifyCodeRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Account account = accountRepository.findByCardNumber(request.getCardNumber())
                .orElseThrow(() -> new EntityNotFoundException("银行卡不存在"));

        // 验证账户属于当前用户
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("无权操作此银行卡");
        }

        // 查找有效的重置请求
        PasswordResetRequest resetRequest = passwordResetRequestRepository
                .findByAccountAndVerificationCodeAndIsUsedFalseAndExpiryTimeAfter(
                        account, request.getVerificationCode(), new Date())
                .orElseThrow(() -> new IllegalArgumentException("验证码无效或已过期"));

        // 更新密码
        account.setPassword(resetRequest.getNewPassword());
        accountRepository.save(account);

        // 标记重置请求为已使用
        resetRequest.setIsUsed(true);
        passwordResetRequestRepository.save(resetRequest);
    }

    @Override
    public void cleanExpiredResetRequests() {
        passwordResetRequestRepository.deleteByExpiryTimeBefore(new Date());
    }

    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 4) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}