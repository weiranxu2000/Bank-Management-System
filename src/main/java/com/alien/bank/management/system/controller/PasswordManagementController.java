package com.alien.bank.management.system.controller;

import com.alien.bank.management.system.model.ResponseModel;
import com.alien.bank.management.system.model.password.ChangePasswordRequestModel;
import com.alien.bank.management.system.model.password.ForgotPasswordRequestModel;
import com.alien.bank.management.system.model.password.VerifyCodeRequestModel;
import com.alien.bank.management.system.service.PasswordManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/password")
@RequiredArgsConstructor
public class PasswordManagementController {

    private final PasswordManagementService passwordManagementService;

    @PostMapping("/change")
    public ResponseEntity<ResponseModel> changePassword(@Valid @RequestBody ChangePasswordRequestModel request) {
        passwordManagementService.changePassword(request);
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data("密码修改成功")
                        .build()
        );
    }

    @PostMapping("/forgot/send-code")
    public ResponseEntity<ResponseModel> sendVerificationCode(@Valid @RequestBody ForgotPasswordRequestModel request) {
        String message = passwordManagementService.sendVerificationCode(request);
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(message)
                        .build()
        );
    }

    @PostMapping("/forgot/verify")
    public ResponseEntity<ResponseModel> verifyCodeAndResetPassword(@Valid @RequestBody VerifyCodeRequestModel request) {
        passwordManagementService.verifyCodeAndResetPassword(request);
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data("密码重置成功")
                        .build()
        );
    }
}