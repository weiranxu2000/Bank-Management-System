-- 删除所有表
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS transaction CASCADE;
DROP TABLE IF EXISTS bank_user CASCADE;
DROP TABLE IF EXISTS card_application CASCADE;
DROP TABLE IF EXISTS loan_application CASCADE;
DROP TABLE IF EXISTS loan CASCADE;
DROP TABLE IF EXISTS password_reset_request CASCADE;

-- 创建用户表
CREATE TABLE bank_user (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 创建账户表
CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(25) UNIQUE NOT NULL,
    password VARCHAR(6) NOT NULL,
    balance DOUBLE PRECISION DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    card_type VARCHAR(10) DEFAULT 'DEBIT' NOT NULL,
    cvv VARCHAR(3),
    credit_limit DOUBLE PRECISION,
    available_credit DOUBLE PRECISION DEFAULT 0.0,
    last_payment_date TIMESTAMP,
    outstanding_balance DOUBLE PRECISION DEFAULT 0.0,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES bank_user(id)
);

-- 创建交易表
CREATE TABLE transaction (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_id INTEGER NOT NULL,
    FOREIGN KEY (account_id) REFERENCES account(id)
);

-- 创建银行卡申请表
CREATE TABLE card_application (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    preferred_password VARCHAR(6) NOT NULL,
    card_type VARCHAR(10) DEFAULT 'DEBIT' NOT NULL,
    requested_credit_limit DOUBLE PRECISION,
    application_reason TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    processed_by INTEGER,
    admin_notes TEXT,
    generated_card_number VARCHAR(25),
    FOREIGN KEY (user_id) REFERENCES bank_user(id),
    FOREIGN KEY (processed_by) REFERENCES bank_user(id)
);

-- 创建贷款申请表
CREATE TABLE loan_application (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    requested_amount DOUBLE PRECISION NOT NULL,
    loan_term_months INTEGER NOT NULL,
    loan_purpose TEXT,
    monthly_income DOUBLE PRECISION,
    existing_debt DOUBLE PRECISION,
    calculated_credit_score DOUBLE PRECISION,
    approved_amount DOUBLE PRECISION,
    monthly_payment DOUBLE PRECISION,
    interest_rate DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'PENDING',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    processed_by INTEGER,
    admin_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES bank_user(id),
    FOREIGN KEY (processed_by) REFERENCES bank_user(id)
);

-- 创建贷款表
CREATE TABLE loan (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    loan_application_id INTEGER NOT NULL,
    principal_amount DOUBLE PRECISION NOT NULL,
    outstanding_balance DOUBLE PRECISION NOT NULL,
    monthly_payment DOUBLE PRECISION NOT NULL,
    interest_rate DOUBLE PRECISION NOT NULL,
    total_term_months INTEGER NOT NULL,
    remaining_terms INTEGER NOT NULL,
    next_payment_date TIMESTAMP,
    last_payment_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES bank_user(id),
    FOREIGN KEY (loan_application_id) REFERENCES loan_application(id)
);

-- 创建密码重置请求表
CREATE TABLE password_reset_request (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_time TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    new_password VARCHAR(6) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES account(id)
);