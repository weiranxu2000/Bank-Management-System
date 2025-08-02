package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.ApplicationStatus;
import com.alien.bank.management.system.entity.CardApplication;
import com.alien.bank.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardApplicationRepository extends JpaRepository<CardApplication, Long> {
    
    List<CardApplication> findByUserOrderByApplicationDateDesc(User user);
    
    List<CardApplication> findByStatusOrderByApplicationDateDesc(ApplicationStatus status);
    
    List<CardApplication> findAllByOrderByApplicationDateDesc();
    
    Long countByStatus(ApplicationStatus status);
}