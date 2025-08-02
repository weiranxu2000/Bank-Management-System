package com.alien.bank.management.system.service;

import com.alien.bank.management.system.model.application.CardApplicationRequestModel;
import com.alien.bank.management.system.model.application.CardApplicationResponseModel;
import com.alien.bank.management.system.model.application.ProcessApplicationRequestModel;

import java.util.List;

public interface CardApplicationService {
    
    // 用户提交银行卡申请
    CardApplicationResponseModel submitApplication(CardApplicationRequestModel request);
    
    // 获取用户的申请列表
    List<CardApplicationResponseModel> getUserApplications();
    
    // 管理员获取所有申请列表
    List<CardApplicationResponseModel> getAllApplications();
    
    // 管理员获取待处理申请列表
    List<CardApplicationResponseModel> getPendingApplications();
    
    // 管理员处理申请
    CardApplicationResponseModel processApplication(Long applicationId, ProcessApplicationRequestModel request);
}