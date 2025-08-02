package com.alien.bank.management.system.service.impl;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.Transaction;
import com.alien.bank.management.system.entity.TransactionType;
import com.alien.bank.management.system.entity.User;
import com.alien.bank.management.system.exception.LowBalanceException;
import com.alien.bank.management.system.mapper.TransactionMapper;
import com.alien.bank.management.system.model.transaction.DepositRequestModel;
import com.alien.bank.management.system.model.transaction.TransactionHistoryResponseModel;
import com.alien.bank.management.system.model.transaction.TransactionResponseModel;
import com.alien.bank.management.system.model.transaction.TransferRequestModel;
import com.alien.bank.management.system.model.transaction.TransferResponseModel;
import com.alien.bank.management.system.model.transaction.WithdrawRequestModel;
import com.alien.bank.management.system.repository.AccountRepository;
import com.alien.bank.management.system.repository.TransactionRepository;
import com.alien.bank.management.system.repository.UserRepository;
import com.alien.bank.management.system.service.TransactionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;


@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final UserRepository userRepository;

    @Override
    public TransactionResponseModel deposit(DepositRequestModel request) {
        Account account = accountRepository
                .findByCardNumber(request.getCard_number())
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));

        Long transactionId = performDeposit(account, request.getAmount(), request.getNotes());

        return transactionMapper.toResponseModel(transactionId, request.getAmount(), account.getBalance());
    }

    @Override
    public TransactionResponseModel withdraw(WithdrawRequestModel request) {
        Account account = accountRepository
                .findByCardNumberAndPassword(request.getCard_number(), request.getPassword())
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));

        Long transactionId = performWithdrawal(account, request.getAmount(), request.getNotes());

        return transactionMapper.toResponseModel(transactionId, request.getAmount(), account.getBalance());
    }

    @Override
    @Transactional
    public TransferResponseModel transfer(TransferRequestModel request) {
        // 1. 验证源账户
        Account fromAccount = accountRepository
                .findByCardNumberAndPassword(request.getFrom_card_number(), request.getPassword())
                .orElseThrow(() -> new BadCredentialsException("源账户验证失败"));

        // 2. 验证目标账户存在
        Account toAccount = accountRepository
                .findByCardNumber(request.getTo_card_number())
                .orElseThrow(() -> new BadCredentialsException("目标账户不存在"));

        // 3. 验证源账户是否属于当前用户
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User " + email + " Not Found"));
        
        if (!fromAccount.getUser().getId().equals(currentUser.getId())) {
            throw new BadCredentialsException("源账户不属于当前用户");
        }

        // 4. 防止自转账
        if (fromAccount.getCardNumber().equals(toAccount.getCardNumber())) {
            throw new IllegalArgumentException("不能向自己转账");
        }

        // 5. 计算手续费（跨行转账收取0.5%手续费，最低2元，最高50元）
        double transferFee = calculateTransferFee(request.getAmount());
        double totalDeduction = request.getAmount() + transferFee;

        // 6. 验证余额是否充足
        if (fromAccount.getBalance() < totalDeduction) {
            throw new LowBalanceException("余额不足，需要 " + totalDeduction + " 元（含手续费 " + transferFee + " 元）");
        }

        // 7. 执行转账
        Long transferId = performTransfer(fromAccount, toAccount, request.getAmount(), transferFee, request.getNotes());

        return TransferResponseModel.builder()
                .transfer_id(transferId)
                .from_card_number(maskCardNumber(fromAccount.getCardNumber()))
                .to_card_number(maskCardNumber(toAccount.getCardNumber()))
                .amount(request.getAmount())
                .transfer_fee(transferFee)
                .from_balance_after(fromAccount.getBalance())
                .notes(request.getNotes())
                .timestamp(new Date().toString())
                .build();
    }

    @Override
    public List<TransactionHistoryResponseModel> getUserTransactionHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User " + email + " Not Found"));
        
        List<Transaction> transactions = transactionRepository.findByUserOrderByTimestampDesc(user);
        return transactionMapper.toHistoryResponseModelList(transactions);
    }

    @Override
    public List<TransactionHistoryResponseModel> getAccountTransactionHistory(Long accountId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User " + email + " Not Found"));
        
        // 验证账户是否属于当前用户
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        
        if (!account.getUser().getId().equals(user.getId())) {
            throw new BadCredentialsException("Account does not belong to current user");
        }
        
        List<Transaction> transactions = transactionRepository.findByAccountIdOrderByTimestampDesc(accountId);
        return transactionMapper.toHistoryResponseModelList(transactions);
    }

    private Long performTransfer(Account fromAccount, Account toAccount, double amount, double fee, String notes) {
        // 1. 从源账户扣款（转账金额 + 手续费）
        updateAccountBalance(fromAccount, -(amount + fee));
        
        // 2. 向目标账户存款
        updateAccountBalance(toAccount, amount);
        
        // 3. 记录转账交易（源账户）
        Transaction fromTransaction = transactionRepository.save(
            Transaction.builder()
                .amount(amount + fee)
                .account(fromAccount)
                .type(TransactionType.TRANSFER)
                .timestamp(new Date())
                .notes("转账给 " + maskCardNumber(toAccount.getCardNumber()) + 
                       (notes != null ? " - " + notes : "") + 
                       " (含手续费 " + fee + " 元)")
                .build()
        );
        
        // 4. 记录转账交易（目标账户）
        transactionRepository.save(
            Transaction.builder()
                .amount(amount)
                .account(toAccount)
                .type(TransactionType.DEPOSIT)
                .timestamp(new Date())
                .notes("收到 " + maskCardNumber(fromAccount.getCardNumber()) + " 转账" + 
                       (notes != null ? " - " + notes : ""))
                .build()
        );
        
        return fromTransaction.getId();
    }

    private double calculateTransferFee(double amount) {
        // 跨行转账手续费：0.5%，最低2元，最高50元
        double fee = amount * 0.005;
        return Math.max(2.0, Math.min(50.0, fee));
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber.length() < 4) return cardNumber;
        return "****" + cardNumber.substring(cardNumber.length() - 4);
    }

    private Long performDeposit(Account account, double amount, String notes) {
        updateAccountBalance(account, amount);
        Transaction transaction = transactionRepository.save(transactionMapper.toEntity(amount, account, TransactionType.DEPOSIT, notes));
        return transaction.getId();
    }

    private Long performWithdrawal(Account account, double amount, String notes) {
        if (account.getBalance() < amount) {
            throw new LowBalanceException("Your Balance " + account.getBalance() + " is not enough to withdraw " + amount);
        }

        updateAccountBalance(account, -amount);
        Transaction transaction = transactionRepository.save(transactionMapper.toEntity(amount, account, TransactionType.WITHDRAW, notes));
        return transaction.getId();
    }

    private void updateAccountBalance(Account account, double amount) {
        account.setBalance(account.getBalance() + amount);
        accountRepository.save(account);
    }
}