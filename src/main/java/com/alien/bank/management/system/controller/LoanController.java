package com.alien.bank.management.system.controller;

import com.alien.bank.management.system.model.ResponseModel;
import com.alien.bank.management.system.model.loan.LoanApplicationRequestModel;
import com.alien.bank.management.system.model.loan.ProcessLoanApplicationRequestModel;
import com.alien.bank.management.system.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/loan")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/apply")
    public ResponseEntity<ResponseModel> submitLoanApplication(@Valid @RequestBody LoanApplicationRequestModel request) {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(loanService.submitLoanApplication(request))
                        .build()
        );
    }

    @GetMapping("/user-applications")
    public ResponseEntity<ResponseModel> getUserLoanApplications() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(loanService.getUserLoanApplications())
                        .build()
        );
    }

    @GetMapping("/user-loans")
    public ResponseEntity<ResponseModel> getUserActiveLoans() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(loanService.getUserActiveLoans())
                        .build()
        );
    }

    @PostMapping("/{loanId}/payment")
    public ResponseEntity<ResponseModel> makeLoanPayment(
            @PathVariable Long loanId,
            @RequestParam Double amount) {
        
        loanService.makeLoanPayment(loanId, amount);
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data("贷款还款成功")
                        .build()
        );
    }

    // 管理员功能
    @GetMapping("/all-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel> getAllLoanApplications() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(loanService.getAllLoanApplications())
                        .build()
        );
    }

    @GetMapping("/pending-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel> getPendingLoanApplications() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(loanService.getPendingLoanApplications())
                        .build()
        );
    }

    @PostMapping("/{applicationId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel> processLoanApplication(
            @PathVariable Long applicationId,
            @Valid @RequestBody ProcessLoanApplicationRequestModel request) {
        
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(loanService.processLoanApplication(applicationId, request))
                        .build()
        );
    }
}