package com.alien.bank.management.system.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;

    @Column(nullable = false, length = 6)
    private String verificationCode;

    @Column(nullable = false)
    private Date requestTime;

    @Column(nullable = false)
    private Date expiryTime;

    @Column
    private Boolean isUsed = false;

    @Column(nullable = false, length = 6)
    private String newPassword;

    @PrePersist
    protected void onCreate() {
        requestTime = new Date();
        // 验证码10分钟后过期
        expiryTime = new Date(System.currentTimeMillis() + 10 * 60 * 1000);
    }
}