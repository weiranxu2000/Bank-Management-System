package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.Optional;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    
    Optional<PasswordResetRequest> findByAccountAndVerificationCodeAndIsUsedFalseAndExpiryTimeAfter(
            Account account, String verificationCode, Date currentTime);
    
    void deleteByExpiryTimeBefore(Date currentTime);
}