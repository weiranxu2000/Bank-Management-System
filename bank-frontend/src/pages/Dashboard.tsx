import React, { useEffect, useState } from "react";
import { Layout, Card, Button, Table, Modal, Form, Input, Select, App } from "antd";
import { PlusOutlined, HistoryOutlined, SwapOutlined, SettingOutlined, KeyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Account } from "../types";
import { accountApi, transactionApi, applicationApi, passwordApi } from "../services/api";

const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const [applications, setApplications] = useState<any[]>([]);
    const [verificationStep, setVerificationStep] = useState(1); // 1: 发送验证码, 2: 验证码验证

    useEffect(() => {
        loadAccounts();
        loadApplications();
        checkAdminRole();
    }, []);

    const checkAdminRole = () => {
        // 从token中解析用户角色（简化实现）
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // 这里需要后端在token中包含角色信息，暂时通过邮箱判断
                if (payload.sub === 'admin@bank.com') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Failed to parse token:", error);
            }
        }
    };

    const loadAccounts = async () => {
        try {
            const response = await accountApi.getAccounts();
            if (response.data.success) {
                setAccounts(response.data.data);
            }
        } catch (error) {
            message.error("获取账户信息失败");
        }
    };

    const loadApplications = async () => {
        try {
            const response = await applicationApi.getUserApplications();
            if (response.data.success) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error("获取申请记录失败", error);
        }
    };

    // 注释：直接创建账户功能已移除，现在通过申请流程
    const handleSubmitApplication = async (values: any) => {
        try {
            const response = await applicationApi.submitApplication({
                preferredPassword: values.preferredPassword,
                applicationReason: values.applicationReason
            });
            if (response.data.success) {
                message.success("银行卡申请提交成功，请等待管理员审核");
                setIsApplicationModalVisible(false);
                loadApplications();
            } else {
                const errorMsg = response.data.errors || "申请提交失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = error.response.data.errors;
                message.error(errorMsg);
            } else {
                message.error("申请提交失败");
            }
        }
    };

    const handleChangePassword = async (values: any) => {
        try {
            const response = await passwordApi.changePassword({
                cardNumber: values.cardNumber,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            });
            if (response.data.success) {
                message.success("密码修改成功");
                setIsPasswordModalVisible(false);
            } else {
                const errorMsg = response.data.errors || "密码修改失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = error.response.data.errors;
                message.error(errorMsg);
            } else {
                message.error("密码修改失败");
            }
        }
    };

    const handleSendVerificationCode = async (values: any) => {
        try {
            const response = await passwordApi.sendVerificationCode({
                cardNumber: values.cardNumber,
                newPassword: values.newPassword
            });
            if (response.data.success) {
                message.success(response.data.data);
                setVerificationStep(2);
            } else {
                const errorMsg = response.data.errors || "发送验证码失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = error.response.data.errors;
                message.error(errorMsg);
            } else {
                message.error("发送验证码失败");
            }
        }
    };

    const handleVerifyAndResetPassword = async (values: any) => {
        try {
            const response = await passwordApi.verifyCodeAndResetPassword({
                cardNumber: values.cardNumber,
                verificationCode: values.verificationCode
            });
            if (response.data.success) {
                message.success("密码重置成功");
                setIsForgotPasswordModalVisible(false);
                setVerificationStep(1);
            } else {
                const errorMsg = response.data.errors || "密码重置失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMsg = error.response.data.errors;
                message.error(errorMsg);
            } else {
                message.error("密码重置失败");
            }
        }
    };

    const handleDeposit = async (values: { amount: number }) => {
        if (!selectedAccount) return;

        try {
            const response = await transactionApi.deposit({
                card_number: selectedAccount.card_number,
                amount: values.amount
            });

            if (response.data.success) {
                message.success("存款成功");
                loadAccounts();
                setIsDepositModalVisible(false);
            }
        } catch (error) {
            message.error("存款失败");
        }
    };

    const handleWithdraw = async (values: { amount: number; password: string }) => {
        if (!selectedAccount) return;

        try {
            const response = await transactionApi.withdraw({
                card_number: selectedAccount.card_number,
                password: values.password,
                amount: values.amount
            });

            if (response.data.success) {
                message.success("取款成功");
                loadAccounts();
                setIsWithdrawModalVisible(false);
            }
        } catch (error) {
            message.error("取款失败");
        }
    };

    const handleTransfer = async (values: { to_card_number: string; amount: number; password: string; notes?: string }) => {
        if (!selectedAccount) return;

        try {
            const response = await transactionApi.transfer({
                from_card_number: selectedAccount.card_number,
                to_card_number: values.to_card_number,
                password: values.password,
                amount: values.amount,
                notes: values.notes
            });

            if (response.data.success) {
                const transferData = response.data.data;
                message.success(`转账成功！转账金额：¥${transferData.amount}，手续费：¥${transferData.transfer_fee}，余额：¥${transferData.from_balance_after}`);
                loadAccounts();
                setIsTransferModalVisible(false);
            } else {
                const errorMsg = response.data.errors || "转账失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            let errorMessage = "转账失败，请稍后重试";
            
            if (error.response && error.response.data && error.response.data.errors) {
                errorMessage = error.response.data.errors;
            }
            
            message.error(errorMessage);
        }
    };

    const accountColumns = [
        { title: "卡号", dataIndex: "card_number", key: "card_number" },
        { title: "余额", dataIndex: "balance", key: "balance" },
        {
            title: "操作",
            key: "action",
            render: (text: string, record: Account) => (
                <>
                    <Button 
                        type="link" 
                        onClick={() => {
                            setSelectedAccount(record);
                            setIsDepositModalVisible(true);
                        }}
                    >
                        存款
                    </Button>
                    <Button 
                        type="link" 
                        onClick={() => {
                            setSelectedAccount(record);
                            setIsWithdrawModalVisible(true);
                        }}
                    >
                        取款
                    </Button>
                                            <Button
                            type="link"
                            onClick={() => {
                                setSelectedAccount(record);
                                setIsTransferModalVisible(true);
                            }}
                        >
                            转账
                        </Button>
                        <Button
                            type="link"
                            onClick={() => {
                                setSelectedAccount(record);
                                setIsPasswordModalVisible(true);
                            }}
                        >
                            改密码
                        </Button>
                </>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ 
                backgroundColor: "#1890ff", 
                display: "flex", 
                alignItems: "center",
                justifyContent: "space-between" 
            }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                        银行管理系统
                    </span>
                </div>
                <div>
                    <Button 
                        type="text"
                        onClick={() => navigate('/transaction-history')} 
                        style={{ color: "white", marginRight: 8 }}
                    >
                        <HistoryOutlined /> 交易历史
                    </Button>
                    {isAdmin && (
                        <Button 
                            type="text"
                            onClick={() => navigate('/admin')} 
                            style={{ color: "white", marginRight: 8 }}
                        >
                            <SettingOutlined /> 系统管理
                        </Button>
                    )}
                    <Button 
                        type="text"
                        onClick={() => {localStorage.removeItem('token'); navigate('/login');}}
                        style={{ color: "white" }}
                    >
                        退出登录
                    </Button>
                </div>
            </Header>
            
            <Content style={{ padding: "24px" }}>
                <Card>
                    <div style={{ marginBottom: 16 }}>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => setIsApplicationModalVisible(true)}
                            style={{ marginRight: 8 }}
                        >
                            申请银行卡
                        </Button>
                        <Button 
                            icon={<KeyOutlined />} 
                            onClick={() => setIsForgotPasswordModalVisible(true)}
                        >
                            忘记密码
                        </Button>
                    </div>
                        <Table 
                            columns={accountColumns} 
                            dataSource={accounts}
                            rowKey="id"
                        />
                </Card>
            </Content>

            <Modal
                title="存款"
                open={isDepositModalVisible}
                onCancel={() => setIsDepositModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleDeposit}>
                    <Form.Item
                        label="金额"
                        name="amount"
                        rules={[
                            { required: true, message: "请输入存款金额" },
                            { 
                                validator: (_, value) => {
                                    const num = parseFloat(value);
                                    if (isNaN(num) || num <= 0) {
                                        return Promise.reject(new Error('金额必须大于0'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input type="number" placeholder="请输入存款金额" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            确认存款
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="取款"
                open={isWithdrawModalVisible}
                onCancel={() => setIsWithdrawModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleWithdraw}>
                    <Form.Item
                        label="金额"
                        name="amount"
                        rules={[
                            { required: true, message: "请输入取款金额" },
                            { 
                                validator: (_, value) => {
                                    const num = parseFloat(value);
                                    if (isNaN(num) || num <= 0) {
                                        return Promise.reject(new Error('金额必须大于0'));
                                    }
                                    if (selectedAccount && num > selectedAccount.balance) {
                                        return Promise.reject(new Error('取款金额不能超过账户余额'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input type="number" placeholder="请输入取款金额" />
                    </Form.Item>
                    <Form.Item
                        label="银行卡密码"
                        name="password"
                        rules={[
                            { required: true, message: "请输入银行卡密码" },
                            { len: 6, message: "密码必须是6位数字" },
                            { pattern: /^\d{6}$/, message: "密码只能包含数字" }
                        ]}
                    >
                        <Input.Password maxLength={6} placeholder="请输入6位银行卡密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            确认取款
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 转账模态框 */}
            <Modal
                title="转账"
                open={isTransferModalVisible}
                onCancel={() => setIsTransferModalVisible(false)}
                footer={null}
            >
                <Form onFinish={handleTransfer}>
                    <Form.Item
                        label="从账户"
                        name="from_account"
                    >
                        <Input 
                            value={selectedAccount?.card_number} 
                            disabled 
                            placeholder="源账户卡号"
                        />
                    </Form.Item>

                    <Form.Item
                        label="目标卡号"
                        name="to_card_number"
                                                    rules={[
                                { required: true, message: "请输入目标卡号!" },
                                { len: 19, message: "卡号必须是19位数字!" },
                                { pattern: /^\d{19}$/, message: "卡号必须是19位数字!" }
                            ]}
                    >
                        <Input 
                            placeholder="请输入目标账户卡号（19位）"
                            maxLength={19}
                        />
                    </Form.Item>

                    <Form.Item
                        label="转账金额"
                        name="amount"
                        rules={[
                            { required: true, message: "请输入转账金额!" },
                            {
                                validator: (_, value) => {
                                    const num = parseFloat(value);
                                    if (isNaN(num) || num <= 0) {
                                        return Promise.reject(new Error("转账金额必须大于0"));
                                    }
                                    if (selectedAccount && num > selectedAccount.balance - 2) {
                                        return Promise.reject(new Error(`余额不足（需预留至少2元手续费）`));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input 
                            type="number" 
                            placeholder="请输入转账金额"
                            min={1}
                            addonAfter="元"
                        />
                    </Form.Item>

                    <Form.Item
                        label="银行卡密码"
                        name="password"
                        rules={[
                            { required: true, message: "请输入银行卡密码!" },
                            { len: 6, message: "密码必须是6位!" },
                            { pattern: /^\d{6}$/, message: "密码必须是6位数字!" }
                        ]}
                    >
                        <Input.Password 
                            placeholder="请输入6位银行卡密码"
                            maxLength={6}
                        />
                    </Form.Item>

                    <Form.Item
                        label="转账备注"
                        name="notes"
                    >
                        <Input.TextArea 
                            placeholder="请输入转账备注（可选）"
                            rows={2}
                            maxLength={50}
                        />
                    </Form.Item>

                    <div style={{ 
                        background: "#f6f6f6", 
                        padding: "12px", 
                        borderRadius: "6px", 
                        marginBottom: "16px",
                        fontSize: "12px",
                        color: "#666"
                    }}>
                        <div>💡 转账手续费说明：</div>
                        <div>• 手续费按转账金额的0.5%收取</div>
                        <div>• 最低收费2元，最高50元</div>
                        <div>• 手续费将从您的账户余额中扣除</div>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            确认转账
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 银行卡申请模态框 */}
            <Modal
                title="申请银行卡"
                open={isApplicationModalVisible}
                onCancel={() => setIsApplicationModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSubmitApplication}
                >
                    <Form.Item
                        label="设置6位银行卡密码"
                        name="preferredPassword"
                        rules={[
                            { required: true, message: "请设置银行卡密码!" },
                            { len: 6, message: "密码必须是6位数字!" },
                            { pattern: /^\d{6}$/, message: "密码必须是数字!" }
                        ]}
                    >
                        <Input.Password
                            maxLength={6}
                            placeholder="请输入6位数字密码"
                        />
                    </Form.Item>

                    <Form.Item
                        label="申请原因"
                        name="applicationReason"
                        rules={[
                            { required: true, message: "请填写申请原因!" },
                            { max: 500, message: "申请原因不能超过500字符!" }
                        ]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="请填写申请银行卡的原因..."
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            提交申请
                        </Button>
                    </Form.Item>
                </Form>

                {applications.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <h4>我的申请记录：</h4>
                        <Table
                            size="small"
                            dataSource={applications}
                            rowKey="id"
                            columns={[
                                { title: "申请时间", dataIndex: "applicationDate", key: "applicationDate", 
                                  render: (date: string) => new Date(date).toLocaleString() },
                                { title: "状态", dataIndex: "status", key: "status",
                                  render: (status: string) => {
                                      const colors = { PENDING: "orange", APPROVED: "green", REJECTED: "red" };
                                      const texts = { PENDING: "待审核", APPROVED: "已批准", REJECTED: "已拒绝" };
                                      return <span style={{color: colors[status as keyof typeof colors]}}>{texts[status as keyof typeof texts]}</span>;
                                  }
                                },
                                { title: "管理员备注", dataIndex: "adminNotes", key: "adminNotes" }
                            ]}
                            pagination={false}
                        />
                    </div>
                )}
            </Modal>

            {/* 修改密码模态框 */}
            <Modal
                title="修改银行卡密码"
                open={isPasswordModalVisible}
                onCancel={() => setIsPasswordModalVisible(false)}
                footer={null}
                width={400}
            >
                <Form
                    layout="vertical"
                    onFinish={handleChangePassword}
                    initialValues={{ cardNumber: selectedAccount?.card_number }}
                >
                    <Form.Item
                        label="银行卡号"
                        name="cardNumber"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        label="原密码"
                        name="oldPassword"
                        rules={[
                            { required: true, message: "请输入原密码!" },
                            { len: 6, message: "密码必须是6位数字!" },
                            { pattern: /^\d{6}$/, message: "密码必须是数字!" }
                        ]}
                    >
                        <Input.Password
                            maxLength={6}
                            placeholder="请输入6位原密码"
                        />
                    </Form.Item>

                    <Form.Item
                        label="新密码"
                        name="newPassword"
                        rules={[
                            { required: true, message: "请输入新密码!" },
                            { len: 6, message: "密码必须是6位数字!" },
                            { pattern: /^\d{6}$/, message: "密码必须是数字!" }
                        ]}
                    >
                        <Input.Password
                            maxLength={6}
                            placeholder="请输入6位新密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            修改密码
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 忘记密码模态框 */}
            <Modal
                title="忘记密码重置"
                open={isForgotPasswordModalVisible}
                onCancel={() => {
                    setIsForgotPasswordModalVisible(false);
                    setVerificationStep(1);
                }}
                footer={null}
                width={400}
            >
                {verificationStep === 1 ? (
                    <Form
                        layout="vertical"
                        onFinish={handleSendVerificationCode}
                    >
                        <Form.Item
                            label="银行卡号"
                            name="cardNumber"
                            rules={[
                                { required: true, message: "请输入银行卡号!" },
                                { len: 19, message: "银行卡号必须是19位数字!" },
                                { pattern: /^\d{19}$/, message: "银行卡号必须是数字!" }
                            ]}
                        >
                            <Input
                                maxLength={19}
                                placeholder="请输入19位银行卡号"
                            />
                        </Form.Item>

                        <Form.Item
                            label="新密码"
                            name="newPassword"
                            rules={[
                                { required: true, message: "请设置新密码!" },
                                { len: 6, message: "密码必须是6位数字!" },
                                { pattern: /^\d{6}$/, message: "密码必须是数字!" }
                            ]}
                        >
                            <Input.Password
                                maxLength={6}
                                placeholder="请输入6位新密码"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                发送验证码
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form
                        layout="vertical"
                        onFinish={handleVerifyAndResetPassword}
                    >
                        <Form.Item
                            label="银行卡号"
                            name="cardNumber"
                            rules={[{ required: true }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            label="验证码"
                            name="verificationCode"
                            rules={[
                                { required: true, message: "请输入验证码!" },
                                { len: 6, message: "验证码必须是6位数字!" },
                                { pattern: /^\d{6}$/, message: "验证码必须是数字!" }
                            ]}
                        >
                            <Input
                                maxLength={6}
                                placeholder="请输入6位验证码"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                验证并重置密码
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="link" 
                                onClick={() => setVerificationStep(1)}
                                block
                            >
                                重新发送验证码
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </Layout>
    );
};

export default Dashboard;
