package com.alien.bank.management.system.controller;

import com.alien.bank.management.system.model.ResponseModel;
import com.alien.bank.management.system.model.payment.CreditCardPaymentRequestModel;
import com.alien.bank.management.system.service.CreditCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/credit-card")
@RequiredArgsConstructor
public class CreditCardController {

    private final CreditCardService creditCardService;

    @PostMapping("/payment")
    public ResponseEntity<ResponseModel> makePayment(@Valid @RequestBody CreditCardPaymentRequestModel request) {
        creditCardService.makePayment(request);
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data("信用卡还款成功")
                        .build()
        );
    }

    @PostMapping("/spend")
    public ResponseEntity<ResponseModel> creditCardSpend(
            @RequestParam String cardNumber,
            @RequestParam String cvv,
            @RequestParam Double amount,
            @RequestParam(required = false) String notes) {
        
        creditCardService.creditCardSpend(cardNumber, cvv, amount, notes);
        return ResponseEntity.ok(
                ResponseModel.builder()
                        .status(HttpStatus.OK)
                        .success(true)
                        .data("信用卡消费成功")
                        .build()
        );
    }
}