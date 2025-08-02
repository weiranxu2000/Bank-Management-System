# 银行管理系统

## 项目简介
基于Spring Boot + React的全栈银行管理系统，提供账户管理、转账、存取款、贷款申请等完整银行业务功能。

## 技术栈

### 后端
- Spring Boot 3.0.9 + Spring Security + JWT
- Spring Data JPA + PostgreSQL + HikariCP
- Maven + OpenAPI 3.0 (Swagger)

### 前端  
- React 18 + TypeScript + Ant Design
- React Router + Axios

## 核心功能
- **用户认证**: JWT认证、角色权限管理
- **账户管理**: 多卡类型支持、银行卡申请
- **交易服务**: 存取款、转账、交易历史
- **贷款业务**: 贷款申请、审批、还款
- **信用卡**: 消费记录、额度管理、还款
- **系统管理**: 用户管理、统计分析、申请审批

## 快速启动

### 后端
```bash
mvn spring-boot:run -Dmaven.test.skip=true
```

### 前端
```bash
cd bank-frontend
npm install
npm start
```

### 访问地址
- 前端: http://localhost:3000
- 后端API: http://localhost:8080
- API文档: http://localhost:8080/swagger-ui.html

## 环境要求
- Java 17+, Maven 3.6+, PostgreSQL 12+
- Node.js 16+, npm 8+
