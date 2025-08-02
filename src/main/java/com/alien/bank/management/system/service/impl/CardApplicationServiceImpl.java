package com.alien.bank.management.system.service.impl;

import com.alien.bank.management.system.entity.*;
import com.alien.bank.management.system.model.application.CardApplicationRequestModel;
import com.alien.bank.management.system.model.application.CardApplicationResponseModel;
import com.alien.bank.management.system.model.application.ProcessApplicationRequestModel;
import com.alien.bank.management.system.repository.AccountRepository;
import com.alien.bank.management.system.repository.CardApplicationRepository;
import com.alien.bank.management.system.repository.UserRepository;
import com.alien.bank.management.system.service.CardApplicationService;
import com.alien.bank.management.system.utils.Utils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CardApplicationServiceImpl implements CardApplicationService {

    private final CardApplicationRepository cardApplicationRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Override
    public CardApplicationResponseModel submitApplication(CardApplicationRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        CardApplication application = CardApplication.builder()
                .user(user)
                .preferredPassword(request.getPreferredPassword())
                .cardType(request.getCardType())
                .requestedCreditLimit(request.getRequestedCreditLimit())
                .applicationReason(request.getApplicationReason())
                .status(ApplicationStatus.PENDING)
                .build();

        CardApplication savedApplication = cardApplicationRepository.save(application);
        return mapToResponseModel(savedApplication);
    }

    @Override
    public List<CardApplicationResponseModel> getUserApplications() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<CardApplication> applications = cardApplicationRepository.findByUserOrderByApplicationDateDesc(user);
        return applications.stream()
                .map(this::mapToResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<CardApplicationResponseModel> getAllApplications() {
        List<CardApplication> applications = cardApplicationRepository.findAllByOrderByApplicationDateDesc();
        return applications.stream()
                .map(this::mapToResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<CardApplicationResponseModel> getPendingApplications() {
        List<CardApplication> applications = cardApplicationRepository.findByStatusOrderByApplicationDateDesc(ApplicationStatus.PENDING);
        return applications.stream()
                .map(this::mapToResponseModel)
                .collect(Collectors.toList());
    }

    @Override
    public CardApplicationResponseModel processApplication(Long applicationId, ProcessApplicationRequestModel request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

        CardApplication application = cardApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));

        application.setStatus(request.getStatus());
        application.setProcessedDate(new Date());
        application.setProcessedBy(admin);
        application.setAdminNotes(request.getAdminNotes());

        // 如果申请被批准，创建银行账户
        if (request.getStatus() == ApplicationStatus.APPROVED) {
            String cardNumber = Utils.generateCardNumber();
            application.setGeneratedCardNumber(cardNumber);

            Account.AccountBuilder accountBuilder = Account.builder()
                    .cardNumber(cardNumber)
                    .password(application.getPreferredPassword())
                    .balance(0.0)
                    .isActive(true)
                    .cardType(application.getCardType())
                    .user(application.getUser());

            // 如果是信用卡，设置信用卡专用字段
            if (application.getCardType() == CardType.CREDIT) {
                String cvv = Utils.generateCVV(); // 需要添加这个方法
                Double creditLimit = application.getRequestedCreditLimit() != null ? 
                    application.getRequestedCreditLimit() : 10000.0; // 默认额度
                
                accountBuilder
                    .cvv(cvv)
                    .creditLimit(creditLimit)
                    .availableCredit(creditLimit)
                    .outstandingBalance(0.0);
            }

            Account account = accountBuilder.build();
            accountRepository.save(account);
        }

        CardApplication savedApplication = cardApplicationRepository.save(application);
        return mapToResponseModel(savedApplication);
    }

    private CardApplicationResponseModel mapToResponseModel(CardApplication application) {
        return CardApplicationResponseModel.builder()
                .id(application.getId())
                .userName(application.getUser().getName())
                .userEmail(application.getUser().getEmail())
                .userPhone(application.getUser().getPhone())
                .cardType(application.getCardType())
                .requestedCreditLimit(application.getRequestedCreditLimit())
                .applicationReason(application.getApplicationReason())
                .status(application.getStatus())
                .applicationDate(application.getApplicationDate())
                .processedDate(application.getProcessedDate())
                .processedByName(application.getProcessedBy() != null ? application.getProcessedBy().getName() : null)
                .adminNotes(application.getAdminNotes())
                .generatedCardNumber(application.getGeneratedCardNumber())
                .build();
    }
}