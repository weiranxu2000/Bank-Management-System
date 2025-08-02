-- Insert sample users
INSERT INTO bank_user (name, password, phone, email, role, is_active) VALUES
    ('张三', '$2a$10$/RjHNaDeovmjfe05cP2qde7K9zAAOHGvoo0U2A9QNPTLsTSbncakS', '13800138000', 'zhangsan@example.com', 'USER', TRUE),  -- 密码: test123
    ('李四', '$2a$10$/RjHNaDeovmjfe05cP2qde7K9zAAOHGvoo0U2A9QNPTLsTSbncakS', '13800138001', 'lisi@example.com', 'USER', TRUE),      -- 密码: test123
    ('王五', '$2a$10$/RjHNaDeovmjfe05cP2qde7K9zAAOHGvoo0U2A9QNPTLsTSbncakS', '13800138002', 'wangwu@example.com', 'USER', TRUE),    -- 密码: test123
    ('系统管理员', '$2a$10$/RjHNaDeovmjfe05cP2qde7K9zAAOHGvoo0U2A9QNPTLsTSbncakS', '13900139000', 'admin@bank.com', 'ADMIN', TRUE);  -- 密码: test123

-- Insert sample accounts (19位中国银行卡号)
INSERT INTO account (card_number, password, balance, is_active, user_id) VALUES
    ('6222021234567890123', '123456', 10000.00, TRUE, 1),  -- 张三的储蓄卡
    ('6222021234567890124', '654321', 50000.00, TRUE, 1),  -- 张三的信用卡  
    ('6222021234567890125', '789012', 8000.00, TRUE, 2),   -- 李四的卡
    ('6222021234567890126', '321654', 15000.00, TRUE, 3);  -- 王五的卡

-- Insert sample transactions
INSERT INTO transaction (type, amount, notes, timestamp, account_id) VALUES
    -- 张三的交易记录
    ('DEPOSIT', 5000.00, '工资入账', CURRENT_TIMESTAMP - INTERVAL '30 days', 1),
    ('WITHDRAW', 2000.00, 'ATM取款', CURRENT_TIMESTAMP - INTERVAL '25 days', 1),
    ('WITHDRAW', 1000.00, '转账给李四', CURRENT_TIMESTAMP - INTERVAL '20 days', 1),
    ('DEPOSIT', 3000.00, '理财收益', CURRENT_TIMESTAMP - INTERVAL '15 days', 2),
    
    -- 李四的交易记录
    ('DEPOSIT', 6000.00, '工资入账', CURRENT_TIMESTAMP - INTERVAL '28 days', 3),
    ('WITHDRAW', 1000.00, '超市购物', CURRENT_TIMESTAMP - INTERVAL '21 days', 3),
    ('DEPOSIT', 1000.00, '收到张三转账', CURRENT_TIMESTAMP - INTERVAL '20 days', 3),
    
    -- 王五的交易记录
    ('DEPOSIT', 8000.00, '工资入账', CURRENT_TIMESTAMP - INTERVAL '30 days', 4),
    ('WITHDRAW', 3000.00, '购买电子产品', CURRENT_TIMESTAMP - INTERVAL '18 days', 4),
    ('DEPOSIT', 10000.00, '投资收益', CURRENT_TIMESTAMP - INTERVAL '10 days', 4);

-- 验证数据
SELECT 'Users count: ' || COUNT(*) FROM bank_user;
SELECT 'Accounts count: ' || COUNT(*) FROM account;
SELECT 'Transactions count: ' || COUNT(*) FROM transaction;