package com.alien.bank.management.system.controller;

import com.alien.bank.management.system.entity.Role;
import com.alien.bank.management.system.model.ResponseModel;
import com.alien.bank.management.system.service.AdminService;
import com.alien.bank.management.system.service.CardApplicationService;
import com.alien.bank.management.system.model.application.ProcessApplicationRequestModel;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CardApplicationService cardApplicationService;

    @GetMapping("/users")
    public ResponseEntity<ResponseModel> getAllUsers() {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.getAllUsers())
                        .build()
        );
    }

    @GetMapping("/accounts")
    public ResponseEntity<ResponseModel> getAllAccounts() {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.getAllAccounts())
                        .build()
        );
    }

    @GetMapping("/transactions")
    public ResponseEntity<ResponseModel> getAllTransactions() {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.getAllTransactions())
                        .build()
        );
    }

    @GetMapping("/statistics")
    public ResponseEntity<ResponseModel> getSystemStatistics() {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.getSystemStatistics())
                        .build()
        );
    }

    @PutMapping("/users/{userId}/freeze")
    public ResponseEntity<ResponseModel> freezeUser(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.freezeUser(userId))
                        .build()
        );
    }

    @PutMapping("/users/{userId}/unfreeze")
    public ResponseEntity<ResponseModel> unfreezeUser(@PathVariable Long userId) {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.unfreezeUser(userId))
                        .build()
        );
    }

    @PutMapping("/accounts/{accountId}/freeze")
    public ResponseEntity<ResponseModel> freezeAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.freezeAccount(accountId))
                        .build()
        );
    }

    @PutMapping("/accounts/{accountId}/unfreeze")
    public ResponseEntity<ResponseModel> unfreezeAccount(@PathVariable Long accountId) {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.unfreezeAccount(accountId))
                        .build()
        );
    }

    @GetMapping("/applications")
    public ResponseEntity<ResponseModel> getAllApplications() {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.getAllApplications())
                        .build()
        );
    }

    @GetMapping("/applications/pending")
    public ResponseEntity<ResponseModel> getPendingApplications() {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(adminService.getPendingApplications())
                        .build()
        );
    }

    @PostMapping("/applications/{applicationId}/process")
    public ResponseEntity<ResponseModel> processApplication(
            @PathVariable Long applicationId,
            @Valid @RequestBody ProcessApplicationRequestModel request) {
        return ResponseEntity.ok(
                ResponseModel
                        .builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(cardApplicationService.processApplication(applicationId, request))
                        .build()
        );
    }
}