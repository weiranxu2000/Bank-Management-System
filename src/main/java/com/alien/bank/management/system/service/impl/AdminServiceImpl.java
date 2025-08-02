package com.alien.bank.management.system.service.impl;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.Transaction;
import com.alien.bank.management.system.entity.User;
import jakarta.persistence.EntityNotFoundException;
import com.alien.bank.management.system.mapper.TransactionMapper;
import com.alien.bank.management.system.model.admin.AdminAccountResponseModel;
import com.alien.bank.management.system.model.admin.AdminUserResponseModel;
import com.alien.bank.management.system.model.admin.SystemStatisticsModel;
import com.alien.bank.management.system.model.application.CardApplicationResponseModel;
import com.alien.bank.management.system.model.transaction.TransactionHistoryResponseModel;
import com.alien.bank.management.system.repository.AccountRepository;
import com.alien.bank.management.system.repository.CardApplicationRepository;
import com.alien.bank.management.system.repository.TransactionRepository;
import com.alien.bank.management.system.repository.UserRepository;
import com.alien.bank.management.system.service.AdminService;
import com.alien.bank.management.system.service.CardApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final CardApplicationService cardApplicationService;

    @Override
    public List<AdminUserResponseModel> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserResponseModel freezeUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setIsActive(false);
        User savedUser = userRepository.save(user);
        return mapToAdminUserResponse(savedUser);
    }

    @Override
    public AdminUserResponseModel unfreezeUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setIsActive(true);
        User savedUser = userRepository.save(user);
        return mapToAdminUserResponse(savedUser);
    }

    @Override
    public List<AdminAccountResponseModel> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return accounts.stream()
                .map(this::mapToAdminAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminAccountResponseModel freezeAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        account.setIsActive(false);
        Account savedAccount = accountRepository.save(account);
        return mapToAdminAccountResponse(savedAccount);
    }

    @Override
    public AdminAccountResponseModel unfreezeAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        account.setIsActive(true);
        Account savedAccount = accountRepository.save(account);
        return mapToAdminAccountResponse(savedAccount);
    }

    @Override
    public List<TransactionHistoryResponseModel> getAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();
        return transactionMapper.toHistoryResponseModelList(transactions);
    }

    @Override
    public SystemStatisticsModel getSystemStatistics() {
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByIsActiveTrue();
        Long totalAccounts = accountRepository.count();
        Long activeAccounts = accountRepository.countByIsActiveTrue();
        Long totalTransactions = transactionRepository.count();
        
        Double totalBalance = accountRepository.findAll().stream()
                .mapToDouble(Account::getBalance)
                .sum();

        // 今日交易统计
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        Date todayStart = Date.from(startOfToday.atZone(ZoneId.systemDefault()).toInstant());
        
        List<Transaction> todayTransactions = transactionRepository.findByTimestampAfter(todayStart);
        Long todayTransactionCount = (long) todayTransactions.size();
        Double todayTransactionAmount = todayTransactions.stream()
                .mapToDouble(Transaction::getAmount)
                .sum();

        // 转账手续费统计（简化计算）
        Double totalTransferFees = todayTransactions.stream()
                .filter(t -> t.getNotes() != null && t.getNotes().contains("手续费"))
                .mapToDouble(t -> {
                    String notes = t.getNotes();
                    if (notes.contains("手续费")) {
                        // 简化提取手续费金额的逻辑
                        return t.getAmount() * 0.005; // 假设平均手续费率
                    }
                    return 0.0;
                })
                .sum();

        return SystemStatisticsModel.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalAccounts(totalAccounts)
                .activeAccounts(activeAccounts)
                .totalTransactions(totalTransactions)
                .totalBalance(totalBalance)
                .todayTransactionAmount(todayTransactionAmount)
                .todayTransactionCount(todayTransactionCount)
                .totalTransferFees(totalTransferFees)
                .build();
    }

    @Override
    public List<CardApplicationResponseModel> getAllApplications() {
        return cardApplicationService.getAllApplications();
    }

    @Override
    public List<CardApplicationResponseModel> getPendingApplications() {
        return cardApplicationService.getPendingApplications();
    }

    private AdminUserResponseModel mapToAdminUserResponse(User user) {
        List<Account> userAccounts = accountRepository.findAllByUser(user);
        Double totalUserBalance = userAccounts.stream()
                .mapToDouble(Account::getBalance)
                .sum();

        return AdminUserResponseModel.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .accountCount(userAccounts.size())
                .totalBalance(totalUserBalance)
                .build();
    }

    private AdminAccountResponseModel mapToAdminAccountResponse(Account account) {
        List<Transaction> accountTransactions = transactionRepository.findByAccount(account);
        
        return AdminAccountResponseModel.builder()
                .id(account.getId())
                .cardNumber(account.getCardNumber())
                .balance(account.getBalance())
                .isActive(account.getIsActive())
                .userName(account.getUser().getName())
                .userEmail(account.getUser().getEmail())
                .transactionCount(accountTransactions.size())
                .build();
    }
}