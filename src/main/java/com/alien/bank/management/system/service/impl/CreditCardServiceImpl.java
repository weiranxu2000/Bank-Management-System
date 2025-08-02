package com.alien.bank.management.system.service.impl;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.CardType;
import com.alien.bank.management.system.entity.Transaction;
import com.alien.bank.management.system.entity.TransactionType;
import com.alien.bank.management.system.entity.User;
import com.alien.bank.management.system.model.payment.CreditCardPaymentRequestModel;
import com.alien.bank.management.system.repository.AccountRepository;
import com.alien.bank.management.system.repository.TransactionRepository;
import com.alien.bank.management.system.repository.UserRepository;
import com.alien.bank.management.system.service.CreditCardService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CreditCardServiceImpl implements CreditCardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    public void makePayment(CreditCardPaymentRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 查找信用卡
        Account creditCard = accountRepository.findByCardNumber(request.getCreditCardNumber())
                .orElseThrow(() -> new EntityNotFoundException("信用卡不存在"));

        if (creditCard.getCardType() != CardType.CREDIT) {
            throw new IllegalArgumentException("指定的卡号不是信用卡");
        }

        if (!creditCard.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("无权操作此信用卡");
        }

        Double paymentAmount = request.getPaymentAmount();
        if (paymentAmount <= 0) {
            throw new IllegalArgumentException("还款金额必须大于0");
        }

        // 还款金额不能超过欠款余额
        if (paymentAmount > creditCard.getOutstandingBalance()) {
            paymentAmount = creditCard.getOutstandingBalance();
        }

        // 如果指定了储蓄卡还款
        if ("DEBIT_CARD".equals(request.getPaymentMethod()) && request.getSourceDebitCardNumber() != null) {
            Account debitCard = accountRepository.findByCardNumber(request.getSourceDebitCardNumber())
                    .orElseThrow(() -> new EntityNotFoundException("储蓄卡不存在"));

            if (debitCard.getCardType() != CardType.DEBIT) {
                throw new IllegalArgumentException("指定的卡号不是储蓄卡");
            }

            if (!debitCard.getUser().getId().equals(user.getId())) {
                throw new IllegalArgumentException("无权操作此储蓄卡");
            }

            if (debitCard.getBalance() < paymentAmount) {
                throw new IllegalArgumentException("储蓄卡余额不足");
            }

            // 从储蓄卡扣款
            debitCard.setBalance(debitCard.getBalance() - paymentAmount);
            accountRepository.save(debitCard);

            // 记录储蓄卡交易
            Transaction debitTransaction = Transaction.builder()
                    .account(debitCard)
                    .type(TransactionType.WITHDRAW)
                    .amount(paymentAmount)
                    .notes("信用卡还款 - 卡号: ****" + creditCard.getCardNumber().substring(15))
                    .timestamp(new Date())
                    .build();
            transactionRepository.save(debitTransaction);
        }

        // 更新信用卡信息
        creditCard.setOutstandingBalance(creditCard.getOutstandingBalance() - paymentAmount);
        creditCard.setAvailableCredit(creditCard.getAvailableCredit() + paymentAmount);
        creditCard.setLastPaymentDate(new Date());
        accountRepository.save(creditCard);

        // 记录信用卡还款交易
        Transaction creditTransaction = Transaction.builder()
                .account(creditCard)
                .type(TransactionType.DEPOSIT)
                .amount(paymentAmount)
                .notes("信用卡还款" + (request.getSourceDebitCardNumber() != null ? 
                    " - 来源储蓄卡: ****" + request.getSourceDebitCardNumber().substring(15) : " - 现金还款"))
                .timestamp(new Date())
                .build();
        transactionRepository.save(creditTransaction);
    }

    @Override
    public void creditCardSpend(String cardNumber, String cvv, Double amount, String notes) {
        Account creditCard = accountRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new EntityNotFoundException("信用卡不存在"));

        if (creditCard.getCardType() != CardType.CREDIT) {
            throw new IllegalArgumentException("指定的卡号不是信用卡");
        }

        if (!creditCard.getCvv().equals(cvv)) {
            throw new IllegalArgumentException("CVV码错误");
        }

        if (!creditCard.getIsActive()) {
            throw new IllegalArgumentException("信用卡已被冻结");
        }

        if (amount > creditCard.getAvailableCredit()) {
            throw new IllegalArgumentException("可用额度不足");
        }

        // 更新信用卡信息
        creditCard.setAvailableCredit(creditCard.getAvailableCredit() - amount);
        creditCard.setOutstandingBalance(creditCard.getOutstandingBalance() + amount);
        accountRepository.save(creditCard);

        // 记录消费交易
        Transaction transaction = Transaction.builder()
                .account(creditCard)
                .type(TransactionType.WITHDRAW)
                .amount(amount)
                .notes(notes != null ? notes : "信用卡消费")
                .timestamp(new Date())
                .build();
        transactionRepository.save(transaction);
    }

    @Override
    public void checkAndFreezeOverdueCards() {
        // 查找所有信用卡
        List<Account> creditCards = accountRepository.findByCardType(CardType.CREDIT);
        
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.DAY_OF_MONTH, -30); // 30天逾期期限
        Date overdueDate = calendar.getTime();

        for (Account creditCard : creditCards) {
            // 如果有欠款且超过30天未还款
            if (creditCard.getOutstandingBalance() > 0 && 
                creditCard.getLastPaymentDate() != null &&
                creditCard.getLastPaymentDate().before(overdueDate)) {
                
                creditCard.setIsActive(false);
                accountRepository.save(creditCard);
                
                // 记录冻结原因
                Transaction freezeTransaction = Transaction.builder()
                        .account(creditCard)
                        .type(TransactionType.WITHDRAW)
                        .amount(0.0)
                        .notes("信用卡因逾期超过30天被自动冻结")
                        .timestamp(now)
                        .build();
                transactionRepository.save(freezeTransaction);
            }
        }
    }

    @Override
    public void calculateAndApplyInterest() {
        List<Account> creditCards = accountRepository.findByCardType(CardType.CREDIT);
        Date now = new Date();
        
        for (Account creditCard : creditCards) {
            if (creditCard.getOutstandingBalance() > 0) {
                // 按月计算利息，年利率18%，月利率1.5%
                Double monthlyInterestRate = 0.015;
                Double interest = creditCard.getOutstandingBalance() * monthlyInterestRate;
                
                creditCard.setOutstandingBalance(creditCard.getOutstandingBalance() + interest);
                creditCard.setAvailableCredit(Math.max(0, creditCard.getCreditLimit() - creditCard.getOutstandingBalance()));
                accountRepository.save(creditCard);
                
                // 记录利息交易
                Transaction interestTransaction = Transaction.builder()
                        .account(creditCard)
                        .type(TransactionType.WITHDRAW)
                        .amount(interest)
                        .notes("信用卡利息费用 - 月利率1.5%")
                        .timestamp(now)
                        .build();
                transactionRepository.save(interestTransaction);
            }
        }
    }
}