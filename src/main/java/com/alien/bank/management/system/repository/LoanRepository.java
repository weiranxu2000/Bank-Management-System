package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.Loan;
import com.alien.bank.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    
    List<Loan> findByUserAndIsActiveTrue(User user);
    
    List<Loan> findByIsActiveTrueAndNextPaymentDateBefore(Date date);
    
    List<Loan> findByIsActiveTrue();
}