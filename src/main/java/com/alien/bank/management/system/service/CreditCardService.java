package com.alien.bank.management.system.service;

import com.alien.bank.management.system.model.payment.CreditCardPaymentRequestModel;

public interface CreditCardService {
    
    // 信用卡还款
    void makePayment(CreditCardPaymentRequestModel request);
    
    // 信用卡消费
    void creditCardSpend(String cardNumber, String cvv, Double amount, String notes);
    
    // 检查并冻结逾期信用卡
    void checkAndFreezeOverdueCards();
    
    // 计算信用卡利息
    void calculateAndApplyInterest();
}