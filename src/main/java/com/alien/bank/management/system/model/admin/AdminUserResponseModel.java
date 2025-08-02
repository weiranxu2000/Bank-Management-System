package com.alien.bank.management.system.model.admin;

import com.alien.bank.management.system.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponseModel {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Boolean isActive;
    private Date createdAt;
    private Integer accountCount;
    private Double totalBalance;
}