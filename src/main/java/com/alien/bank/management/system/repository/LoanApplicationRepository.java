package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.ApplicationStatus;
import com.alien.bank.management.system.entity.LoanApplication;
import com.alien.bank.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    
    List<LoanApplication> findByUserOrderByApplicationDateDesc(User user);
    
    List<LoanApplication> findByStatusOrderByApplicationDateDesc(ApplicationStatus status);
    
    List<LoanApplication> findAllByOrderByApplicationDateDesc();
    
    Long countByStatus(ApplicationStatus status);
}