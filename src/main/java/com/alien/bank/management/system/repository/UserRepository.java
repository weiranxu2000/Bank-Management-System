package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
    
    // 管理员功能：统计活跃用户数量
    Long countByIsActiveTrue();
}
