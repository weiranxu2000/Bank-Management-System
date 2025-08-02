package com.alien.bank.management.system.service.impl;

import com.alien.bank.management.system.entity.*;
import com.alien.bank.management.system.model.loan.LoanApplicationRequestModel;
import com.alien.bank.management.system.model.loan.LoanApplicationResponseModel;
import com.alien.bank.management.system.model.loan.ProcessLoanApplicationRequestModel;
import com.alien.bank.management.system.repository.*;
import com.alien.bank.management.system.service.LoanService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LoanServiceImpl implements LoanService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Override
    public LoanApplicationResponseModel submitLoanApplication(LoanApplicationRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 计算信用评分
        Double creditScore = calculateCreditScore(
            request.getMonthlyIncome(), 
            request.getExistingDebt() != null ? request.getExistingDebt() : 0.0, 
            request.getRequestedAmount()
        );

        LoanApplication application = LoanApplication.builder()
                .user(user)
                .requestedAmount(request.getRequestedAmount())
                .loanTermMonths(request.getLoanTermMonths())
                .loanPurpose(request.getLoanPurpose())
                .monthlyIncome(request.getMonthlyIncome())
                .existingDebt(request.getExistingDebt() != null ? request.getExistingDebt() : 0.0)
                .calculatedCreditScore(creditScore)
                .status(ApplicationStatus.PENDING)
                .build();

        LoanApplication savedApplication = loanApplicationRepository.save(application);
        return mapToResponseModel(savedApplication);
    }

    @Override
    public List<LoanApplicationResponseModel> getUserLoanApplications() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<LoanApplication> applications = loanApplicationRepository.findByUserOrderByApplicationDateDesc(user);
        return applications.stream()
                .map(this::mapToResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanApplicationResponseModel> getAllLoanApplications() {
        List<LoanApplication> applications = loanApplicationRepository.findAllByOrderByApplicationDateDesc();
        return applications.stream()
                .map(this::mapToResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanApplicationResponseModel> getPendingLoanApplications() {
        List<LoanApplication> applications = loanApplicationRepository.findByStatusOrderByApplicationDateDesc(ApplicationStatus.PENDING);
        return applications.stream()
                .map(this::mapToResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public LoanApplicationResponseModel processLoanApplication(Long applicationId, ProcessLoanApplicationRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Loan application not found"));

        application.setStatus(request.getStatus());
        application.setProcessedDate(new Date());
        application.setProcessedBy(admin);
        application.setAdminNotes(request.getAdminNotes());

        if (request.getStatus() == ApplicationStatus.APPROVED) {
            Double approvedAmount = request.getApprovedAmount() != null ? 
                request.getApprovedAmount() : application.getRequestedAmount();
            Double interestRate = request.getInterestRate() != null ? 
                request.getInterestRate() : 0.12; // 默认年利率12%

            application.setApprovedAmount(approvedAmount);
            application.setInterestRate(interestRate);

            // 计算月还款额
            Double monthlyPayment = calculateMonthlyPayment(
                approvedAmount, 
                interestRate, 
                application.getLoanTermMonths()
            );
            application.setMonthlyPayment(monthlyPayment);

            // 创建贷款记录
            Calendar nextPaymentCal = Calendar.getInstance();
            nextPaymentCal.add(Calendar.MONTH, 1);

            Loan loan = Loan.builder()
                    .user(application.getUser())
                    .loanApplication(application)
                    .principalAmount(approvedAmount)
                    .outstandingBalance(approvedAmount)
                    .monthlyPayment(monthlyPayment)
                    .interestRate(interestRate)
                    .totalTermMonths(application.getLoanTermMonths())
                    .remainingTerms(application.getLoanTermMonths())
                    .nextPaymentDate(nextPaymentCal.getTime())
                    .isActive(true)
                    .build();

            loanRepository.save(loan);
        }

        LoanApplication savedApplication = loanApplicationRepository.save(application);
        return mapToResponseModel(savedApplication);
    }

    @Override
    public List<Object> getUserActiveLoans() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Loan> loans = loanRepository.findByUserAndIsActiveTrue(user);
        return loans.stream().map(loan -> {
            Map<String, Object> loanInfo = new HashMap<>();
            loanInfo.put("id", loan.getId());
            loanInfo.put("principalAmount", loan.getPrincipalAmount());
            loanInfo.put("outstandingBalance", loan.getOutstandingBalance());
            loanInfo.put("monthlyPayment", loan.getMonthlyPayment());
            loanInfo.put("interestRate", loan.getInterestRate());
            loanInfo.put("remainingTerms", loan.getRemainingTerms());
            loanInfo.put("nextPaymentDate", loan.getNextPaymentDate());
            loanInfo.put("loanPurpose", loan.getLoanApplication().getLoanPurpose());
            return loanInfo;
        }).collect(Collectors.toList());
    }

    @Override
    public void makeLoanPayment(Long loanId, Double amount) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new EntityNotFoundException("Loan not found"));

        if (!loan.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("无权操作此贷款");
        }

        if (amount <= 0) {
            throw new IllegalArgumentException("还款金额必须大于0");
        }

        if (amount > loan.getOutstandingBalance()) {
            amount = loan.getOutstandingBalance(); // 不能超过剩余欠款
        }

        // 更新贷款信息
        loan.setOutstandingBalance(loan.getOutstandingBalance() - amount);
        loan.setLastPaymentDate(new Date());

        // 如果还完了，设置为不活跃
        if (loan.getOutstandingBalance() <= 0) {
            loan.setIsActive(false);
            loan.setRemainingTerms(0);
        } else {
            // 计算剩余期数
            loan.setRemainingTerms(Math.max(0, 
                (int) Math.ceil(loan.getOutstandingBalance() / loan.getMonthlyPayment())));
            
            // 更新下次还款日期
            Calendar nextPaymentCal = Calendar.getInstance();
            nextPaymentCal.add(Calendar.MONTH, 1);
            loan.setNextPaymentDate(nextPaymentCal.getTime());
        }

        loanRepository.save(loan);
    }

    @Override
    public Double calculateCreditScore(Double monthlyIncome, Double existingDebt, Double requestedAmount) {
        // 简化的信用评分算法
        // 基础分：700分
        Double baseScore = 700.0;
        
        // 收入评分：月收入越高分数越高
        Double incomeScore = Math.min(100, monthlyIncome / 1000 * 10);
        
        // 债务比例评分：现有债务与收入比例越低分数越高
        Double debtRatio = existingDebt / monthlyIncome;
        Double debtScore = Math.max(0, 100 - debtRatio * 200);
        
        // 申请金额评分：申请金额与收入比例合理分数越高
        Double requestRatio = requestedAmount / monthlyIncome;
        Double requestScore = Math.max(0, 100 - Math.max(0, requestRatio - 10) * 10);
        
        return Math.min(850, baseScore + incomeScore + debtScore + requestScore);
    }

    private Double calculateMonthlyPayment(Double principal, Double annualRate, Integer months) {
        Double monthlyRate = annualRate / 12;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
               (Math.pow(1 + monthlyRate, months) - 1);
    }

    private LoanApplicationResponseModel mapToResponseModel(LoanApplication application) {
        return LoanApplicationResponseModel.builder()
                .id(application.getId())
                .userName(application.getUser().getName())
                .userEmail(application.getUser().getEmail())
                .requestedAmount(application.getRequestedAmount())
                .loanTermMonths(application.getLoanTermMonths())
                .loanPurpose(application.getLoanPurpose())
                .monthlyIncome(application.getMonthlyIncome())
                .existingDebt(application.getExistingDebt())
                .calculatedCreditScore(application.getCalculatedCreditScore())
                .approvedAmount(application.getApprovedAmount())
                .monthlyPayment(application.getMonthlyPayment())
                .interestRate(application.getInterestRate())
                .status(application.getStatus())
                .applicationDate(application.getApplicationDate())
                .processedDate(application.getProcessedDate())
                .processedByName(application.getProcessedBy() != null ? application.getProcessedBy().getName() : null)
                .adminNotes(application.getAdminNotes())
                .build();
    }
}