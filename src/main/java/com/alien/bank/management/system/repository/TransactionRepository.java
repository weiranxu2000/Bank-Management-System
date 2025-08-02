package com.alien.bank.management.system.repository;

import com.alien.bank.management.system.entity.Account;
import com.alien.bank.management.system.entity.Transaction;
import com.alien.bank.management.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    // 根据账户查询交易历史
    List<Transaction> findByAccountOrderByTimestampDesc(Account account);
    
    // 根据用户查询所有账户的交易历史
    @Query("SELECT t FROM Transaction t WHERE t.account.user = :user ORDER BY t.timestamp DESC")
    List<Transaction> findByUserOrderByTimestampDesc(@Param("user") User user);
    
    // 根据账户ID查询交易历史
    @Query("SELECT t FROM Transaction t WHERE t.account.id = :accountId ORDER BY t.timestamp DESC")
    List<Transaction> findByAccountIdOrderByTimestampDesc(@Param("accountId") Long accountId);
    
    // 管理员功能：根据时间查询交易
    List<Transaction> findByTimestampAfter(Date timestamp);
    
    // 根据账户查询交易记录
    List<Transaction> findByAccount(Account account);
}
