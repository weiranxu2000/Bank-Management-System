package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.CardType;
import com.alien.bank.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    boolean existsByCardNumber(String cardNumber);

    List<Account> findAllByUser(User user);

    Optional<Account> findByCardNumber(String cardNumber);

    Optional<Account> findByCardNumberAndPassword(String cardNumber, String password);
    
    // 管理员功能：统计活跃账户数量
    Long countByIsActiveTrue();
    
    // 根据卡片类型查询
    List<Account> findByCardType(CardType cardType);
}
