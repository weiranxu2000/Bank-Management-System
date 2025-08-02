package com.alien.bank.management.system.controller;

import com.alien.bank.management.system.model.ResponseModel;
import com.alien.bank.management.system.model.application.CardApplicationRequestModel;
import com.alien.bank.management.system.model.application.ProcessApplicationRequestModel;
import com.alien.bank.management.system.service.CardApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/application")
@RequiredArgsConstructor
public class CardApplicationController {

    private final CardApplicationService cardApplicationService;

    @PostMapping("/submit")
    public ResponseEntity<ResponseModel> submitApplication(@Valid @RequestBody CardApplicationRequestModel request) {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(cardApplicationService.submitApplication(request))
                        .build()
        );
    }

    @GetMapping("/user")
    public ResponseEntity<ResponseModel> getUserApplications() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(cardApplicationService.getUserApplications())
                        .build()
        );
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel> getAllApplications() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(cardApplicationService.getAllApplications())
                        .build()
        );
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel> getPendingApplications() {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(cardApplicationService.getPendingApplications())
                        .build()
        );
    }

    @PostMapping("/{applicationId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseModel> processApplication(
            @PathVariable Long applicationId,
            @Valid @RequestBody ProcessApplicationRequestModel request) {
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data(cardApplicationService.processApplication(applicationId, request))
                        .build()
        );
    }
}