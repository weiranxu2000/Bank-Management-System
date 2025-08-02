-- 修复后的信用卡数据

-- 为现有用户添加新的信用卡账户（使用不重复的卡号）
INSERT INTO account (card_number, password, balance, is_active, card_type, cvv, credit_limit, available_credit, outstanding_balance, user_id) VALUES
('6222028888999900001', '123456', 0.0, true, 'CREDIT', '123', 50000.0, 48000.0, 2000.0, 1),
('6222028888999900002', '654321', 0.0, true, 'CREDIT', '456', 30000.0, 25000.0, 5000.0, 2),
('6222028888999900003', '111111', 0.0, true, 'CREDIT', '789', 80000.0, 70000.0, 10000.0, 3),
('6222028888999900004', '222222', 0.0, true, 'CREDIT', '321', 100000.0, 95000.0, 5000.0, 4);

-- 添加信用卡申请记录
INSERT INTO card_application (user_id, preferred_password, card_type, requested_credit_limit, application_reason, status, application_date, processed_date, processed_by, admin_notes, generated_card_number) VALUES
(1, '123456', 'CREDIT', 50000.0, '需要信用卡用于日常消费和在线购物', 'APPROVED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 1, '信用评估良好，批准申请', '6222028888999900001'),
(2, '654321', 'CREDIT', 30000.0, '出差需要信用卡支付住宿和交通', 'APPROVED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 1, '批准较低额度，建议按时还款', '6222028888999900002'),
(3, '111111', 'CREDIT', 100000.0, '投资理财和大额消费需要', 'APPROVED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days', 1, '批准80000额度，高级客户', '6222028888999900003'),
(4, '222222', 'CREDIT', 100000.0, '商务消费和企业采购', 'APPROVED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', 1, '企业用户，批准较高额度', '6222028888999900004');

-- 添加信用卡消费交易记录
INSERT INTO transaction (type, amount, notes, timestamp, account_id) 
SELECT 'WITHDRAW', 2000.0, '信用卡消费 - 购物中心', NOW() - INTERVAL '5 days', id FROM account WHERE card_number = '6222028888999900001'
UNION ALL
SELECT 'DEPOSIT', 1000.0, '信用卡还款 - 现金还款', NOW() - INTERVAL '3 days', id FROM account WHERE card_number = '6222028888999900001'
UNION ALL
SELECT 'WITHDRAW', 3000.0, '信用卡消费 - 酒店住宿', NOW() - INTERVAL '8 days', id FROM account WHERE card_number = '6222028888999900002'
UNION ALL
SELECT 'DEPOSIT', 2000.0, '信用卡还款 - 储蓄卡转账', NOW() - INTERVAL '2 days', id FROM account WHERE card_number = '6222028888999900002'
UNION ALL
SELECT 'WITHDRAW', 5000.0, '信用卡消费 - 投资理财', NOW() - INTERVAL '12 days', id FROM account WHERE card_number = '6222028888999900003'
UNION ALL
SELECT 'WITHDRAW', 3000.0, '信用卡消费 - 商务差旅', NOW() - INTERVAL '6 days', id FROM account WHERE card_number = '6222028888999900003'
UNION ALL
SELECT 'WITHDRAW', 4000.0, '信用卡消费 - 企业采购', NOW() - INTERVAL '4 days', id FROM account WHERE card_number = '6222028888999900004'
UNION ALL
SELECT 'DEPOSIT', 1000.0, '信用卡还款 - 部分还款', NOW() - INTERVAL '1 day', id FROM account WHERE card_number = '6222028888999900004';

-- 添加贷款申请记录
INSERT INTO loan_application (user_id, requested_amount, loan_term_months, loan_purpose, monthly_income, existing_debt, calculated_credit_score, status, application_date, processed_date, processed_by, approved_amount, monthly_payment, interest_rate, admin_notes) VALUES
(2, 100000.0, 24, '房屋装修贷款', 15000.0, 5000.0, 758.5, 'APPROVED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 1, 80000.0, 3800.0, 0.10, '批准80%额度'),
(3, 200000.0, 36, '创业贷款', 25000.0, 10000.0, 782.0, 'PENDING', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL, NULL, NULL),
(1, 50000.0, 12, '汽车贷款', 12000.0, 2000.0, 795.5, 'APPROVED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days', 1, 50000.0, 4500.0, 0.08, '优质客户，批准全额'),
(4, 150000.0, 30, '经营贷款', 30000.0, 5000.0, 810.0, 'APPROVED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 1, 150000.0, 5200.0, 0.09, '企业用户，优惠利率');

-- 为已批准的贷款创建贷款记录
INSERT INTO loan (user_id, loan_application_id, principal_amount, outstanding_balance, monthly_payment, interest_rate, total_term_months, remaining_terms, next_payment_date, is_active) VALUES
(1, (SELECT id FROM loan_application WHERE user_id = 1 AND status = 'APPROVED' AND loan_purpose = '汽车贷款'), 50000.0, 45000.0, 4500.0, 0.08, 12, 10, NOW() + INTERVAL '1 month', true),
(2, (SELECT id FROM loan_application WHERE user_id = 2 AND status = 'APPROVED'), 80000.0, 76000.0, 3800.0, 0.10, 24, 22, NOW() + INTERVAL '1 month', true),
(4, (SELECT id FROM loan_application WHERE user_id = 4 AND status = 'APPROVED'), 150000.0, 140000.0, 5200.0, 0.09, 30, 28, NOW() + INTERVAL '1 month', true);

-- 更新现有储蓄卡的余额
UPDATE account SET balance = 15000.0 WHERE card_number = '6222021111222233333';
UPDATE account SET balance = 25000.0 WHERE card_number = '6222022222333344444';
UPDATE account SET balance = 35000.0 WHERE card_number = '6222023333444455555';
UPDATE account SET balance = 45000.0 WHERE card_number = '6222024444555566666';