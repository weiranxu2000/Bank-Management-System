import React, { useEffect, useState } from "react";
import { Layout, Card, Button, Table, Modal, Form, Input, Select, App, Tag, Statistic, Row, Col, Tabs, InputNumber } from "antd";
import { 
    PlusOutlined, 
    HistoryOutlined, 
    SwapOutlined, 
    SettingOutlined, 
    KeyOutlined, 
    CreditCardOutlined, 
    DollarOutlined, 
    BankOutlined,
    PayCircleOutlined,
    WalletOutlined,
    TrophyOutlined,
    FireOutlined,
    ThunderboltOutlined,
    StarOutlined,
    GiftOutlined,
    SafetyOutlined,
    MoneyCollectOutlined,
    RiseOutlined,
    FallOutlined,
    EyeOutlined,
    LogoutOutlined,
    UserOutlined,
    HomeOutlined,
    BarChartOutlined,
    LineChartOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Account, DepositRequest, WithdrawRequest, TransferRequest, CreditCardPaymentRequest, LoanApplicationRequest, LoanInfo } from "../types";
import { accountApi, transactionApi, applicationApi, passwordApi, creditCardApi, loanApi } from "../services/api";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const EnhancedDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
    const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // 银行卡申请相关
    const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
    const [applications, setApplications] = useState<any[]>([]);
    
    // 密码管理相关
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);
    const [verificationStep, setVerificationStep] = useState(1);
    
    // 信用卡功能
    const [isCreditPaymentModalVisible, setIsCreditPaymentModalVisible] = useState(false);
    const [isCreditSpendModalVisible, setIsCreditSpendModalVisible] = useState(false);
    
    // 贷款功能
    const [isLoanApplicationModalVisible, setIsLoanApplicationModalVisible] = useState(false);
    const [isLoanModalVisible, setIsLoanModalVisible] = useState(false);
    const [isLoanPaymentModalVisible, setIsLoanPaymentModalVisible] = useState(false);
    const [loans, setLoans] = useState<LoanInfo[]>([]);
    const [loanApplications, setLoanApplications] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<LoanInfo | null>(null);

    useEffect(() => {
        loadAccounts();
        loadApplications();
        loadLoans();
        loadLoanApplications();
        checkAdminRole();
    }, []);

    const checkAdminRole = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.sub === 'admin@bank.com');
            } catch (error) {
                console.error('Failed to parse token:', error);
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
            message.error("获取账户失败");
        }
    };

    const loadApplications = async () => {
        try {
            const response = await applicationApi.getUserApplications();
            if (response.data.success) {
                setApplications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load applications:', error);
        }
    };

    const loadLoans = async () => {
        try {
            const response = await loanApi.getUserLoans();
            if (response.data.success) {
                setLoans(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load loans:', error);
        }
    };

    const loadLoanApplications = async () => {
        try {
            const response = await loanApi.getUserApplications();
            if (response.data.success) {
                setLoanApplications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load loan applications:', error);
        }
    };

    const handleDeposit = async (values: DepositRequest) => {
        try {
            const response = await transactionApi.deposit(values);
            if (response.data.success) {
                message.success("存款成功");
                setIsDepositModalVisible(false);
                loadAccounts();
            }
        } catch (error) {
            message.error("存款失败");
        }
    };

    const handleWithdraw = async (values: WithdrawRequest) => {
        try {
            const response = await transactionApi.withdraw(values);
            if (response.data.success) {
                message.success("取款成功");
                setIsWithdrawModalVisible(false);
                loadAccounts();
            }
        } catch (error) {
            message.error("取款失败");
        }
    };

    const handleTransfer = async (values: TransferRequest) => {
        try {
            const response = await transactionApi.transfer(values);
            if (response.data.success) {
                message.success("转账成功");
                setIsTransferModalVisible(false);
                loadAccounts();
            }
        } catch (error) {
            message.error("转账失败");
        }
    };

    const handleSubmitApplication = async (values: any) => {
        try {
            const response = await applicationApi.submitApplication(values);
            if (response.data.success) {
                message.success("申请提交成功，请等待审核");
                setIsApplicationModalVisible(false);
                loadApplications();
            }
        } catch (error) {
            message.error("申请提交失败");
        }
    };

    const handleCreditCardPayment = async (values: CreditCardPaymentRequest) => {
        try {
            const response = await creditCardApi.makePayment(values);
            if (response.data.success) {
                message.success("信用卡还款成功");
                setIsCreditPaymentModalVisible(false);
                loadAccounts();
            }
        } catch (error) {
            message.error("还款失败");
        }
    };

    const handleCreditCardSpend = async (values: any) => {
        try {
            const response = await creditCardApi.creditCardSpend(
                values.cardNumber, 
                values.cvv, 
                values.amount, 
                values.notes
            );
            if (response.data.success) {
                message.success("信用卡消费成功");
                setIsCreditSpendModalVisible(false);
                loadAccounts();
            }
        } catch (error) {
            message.error("消费失败");
        }
    };

    const handleLoanApplication = async (values: LoanApplicationRequest) => {
        try {
            const response = await loanApi.applyLoan(values);
            if (response.data.success) {
                message.success("贷款申请提交成功");
                setIsLoanApplicationModalVisible(false);
                loadLoanApplications();
            }
        } catch (error) {
            message.error("贷款申请失败");
        }
    };

    const handleLoanPayment = async (loanId: number, amount: number) => {
        try {
            const response = await loanApi.makeLoanPayment(loanId, amount);
            if (response.data.success) {
                message.success("贷款还款成功");
                loadLoans();
            }
        } catch (error) {
            message.error("还款失败");
        }
    };

    // 密码管理函数
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

    const getCardTypeTag = (cardType: string) => {
        return cardType === 'CREDIT' ? 
            <Tag color="gold">信用卡</Tag> : 
            <Tag color="green">储蓄卡</Tag>;
    };

    const getStatusTag = (status: string) => {
        const colorMap: { [key: string]: string } = {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red'
        };
        const textMap: { [key: string]: string } = {
            'PENDING': '待审核',
            'APPROVED': '已批准', 
            'REJECTED': '已拒绝'
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
    };

    const accountColumns = [
        {
            title: '卡号',
            dataIndex: 'card_number',
            key: 'card_number',
            render: (text: string) => `****${text.slice(-4)}`
        },
        {
            title: '卡片类型',
            dataIndex: 'cardType',
            key: 'cardType',
            render: (cardType: string) => getCardTypeTag(cardType)
        },
        {
            title: '余额/可用额度',
            key: 'balance',
            render: (record: Account) => (
                <div>
                    {(record.cardType || 'DEBIT') === 'CREDIT' ? (
                        <>
                            <div>可用: ¥{record.availableCredit?.toLocaleString()}</div>
                            <div>欠款: ¥{record.outstandingBalance?.toLocaleString()}</div>
                        </>
                    ) : (
                        <div>余额: ¥{record.balance.toLocaleString()}</div>
                    )}
                </div>
            )
        },
        {
            title: '操作',
            key: 'actions',
            render: (record: Account) => (
                <div>
                    {(record.cardType || 'DEBIT') === 'DEBIT' ? (
                        <>
                            <Button 
                                size="small" 
                                onClick={() => {setSelectedAccount(record); setIsDepositModalVisible(true);}}
                                style={{ marginRight: 8 }}
                            >
                                存款
                            </Button>
                            <Button 
                                size="small" 
                                onClick={() => {setSelectedAccount(record); setIsWithdrawModalVisible(true);}}
                                style={{ marginRight: 8 }}
                            >
                                取款
                            </Button>
                            <Button 
                                size="small" 
                                onClick={() => {setSelectedAccount(record); setIsTransferModalVisible(true);}}
                            >
                                转账
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                size="small" 
                                onClick={() => {setSelectedAccount(record); setIsCreditSpendModalVisible(true);}}
                                style={{ marginRight: 8 }}
                            >
                                消费
                            </Button>
                            <Button 
                                size="small" 
                                onClick={() => {setSelectedAccount(record); setIsCreditPaymentModalVisible(true);}}
                            >
                                还款
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const loanColumns = [
        {
            title: '贷款用途',
            dataIndex: 'loanPurpose',
            key: 'loanPurpose',
        },
        {
            title: '本金',
            dataIndex: 'principalAmount',
            key: 'principalAmount',
            render: (amount: number) => `¥${amount.toLocaleString()}`
        },
        {
            title: '剩余欠款',
            dataIndex: 'outstandingBalance',
            key: 'outstandingBalance',
            render: (amount: number) => `¥${amount.toLocaleString()}`
        },
        {
            title: '月还款',
            dataIndex: 'monthlyPayment',
            key: 'monthlyPayment',
            render: (amount: number) => `¥${amount.toLocaleString()}`
        },
        {
            title: '剩余期数',
            dataIndex: 'remainingTerms',
            key: 'remainingTerms',
            render: (terms: number) => `${terms}期`
        },
        {
            title: '下次还款日',
            dataIndex: 'nextPaymentDate',
            key: 'nextPaymentDate',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: '操作',
            key: 'actions',
            render: (record: LoanInfo) => (
                <Button 
                    size="small" 
                    onClick={() => {
                        setSelectedLoan(record);
                        setIsLoanPaymentModalVisible(true);
                    }}
                >
                    还款
                </Button>
            )
        }
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
                    <BankOutlined style={{ color: "white", fontSize: "24px", marginRight: 8 }} />
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
                        <LogoutOutlined /> 退出登录
                    </Button>
                </div>
            </Header>
            
            <Content style={{ padding: "24px" }}>
                <Card>
                    <Tabs defaultActiveKey="1">
                        <TabPane 
                            tab={<span><CreditCardOutlined />我的账户</span>} 
                            key="1"
                        >
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
                                    onClick={() => setIsPasswordModalVisible(true)}
                                    style={{ marginRight: 8 }}
                                >
                                    改密码
                                </Button>
                                <Button 
                                    onClick={() => setIsForgotPasswordModalVisible(true)}
                                >
                                    忘记密码
                                </Button>
                            </div>
                        
                        <Table 
                            columns={accountColumns} 
                            dataSource={accounts}
                            rowKey="card_number"
                            pagination={false}
                        />
                    </TabPane>
                    
                    <TabPane 
                        tab={<span><BankOutlined />我的贷款</span>} 
                        key="2"
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Button 
                                type="primary" 
                                icon={<DollarOutlined />} 
                                onClick={() => setIsLoanApplicationModalVisible(true)}
                            >
                                申请贷款
                            </Button>
                        </div>
                        
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <Card>
                                    <Statistic 
                                        title="活跃贷款" 
                                        value={loans.length} 
                                        suffix="笔"
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic 
                                        title="总欠款" 
                                        value={loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0)} 
                                        precision={2}
                                        prefix="¥"
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic 
                                        title="月还款总额" 
                                        value={loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)} 
                                        precision={2}
                                        prefix="¥"
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <Table 
                            columns={loanColumns} 
                            dataSource={loans}
                            rowKey="id"
                            pagination={false}
                        />
                    </TabPane>
                    
                    <TabPane 
                        tab={<span><PayCircleOutlined />申请记录</span>} 
                        key="3"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="银行卡申请">
                                    <Table 
                                        dataSource={applications}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                        columns={[
                                            {
                                                title: '类型',
                                                dataIndex: 'cardType',
                                                render: getCardTypeTag
                                            },
                                            {
                                                title: '状态',
                                                dataIndex: 'status',
                                                render: getStatusTag
                                            },
                                            {
                                                title: '申请日期',
                                                dataIndex: 'applicationDate',
                                                render: (date: string) => new Date(date).toLocaleDateString()
                                            }
                                        ]}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="贷款申请">
                                    <Table 
                                        dataSource={loanApplications}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                        columns={[
                                            {
                                                title: '用途',
                                                dataIndex: 'loanPurpose',
                                            },
                                            {
                                                title: '金额',
                                                dataIndex: 'requestedAmount',
                                                render: (amount: number) => `¥${amount.toLocaleString()}`
                                            },
                                            {
                                                title: '状态',
                                                dataIndex: 'status',
                                                render: getStatusTag
                                            }
                                        ]}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
                </Card>

                {/* 各种Modal组件 */}


                {/* 银行卡申请Modal */}
                <Modal
                    title="申请银行卡"
                    open={isApplicationModalVisible}
                    onCancel={() => setIsApplicationModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    <Form onFinish={handleSubmitApplication} layout="vertical">
                        <Form.Item
                            name="cardType"
                            label="卡片类型"
                            rules={[{ required: true, message: '请选择卡片类型' }]}
                            initialValue="DEBIT"
                        >
                            <Select placeholder="选择卡片类型">
                                <Select.Option value="DEBIT">储蓄卡</Select.Option>
                                <Select.Option value="CREDIT">信用卡</Select.Option>
                            </Select>
                        </Form.Item>
                        
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => 
                                prevValues.cardType !== currentValues.cardType
                            }
                        >
                            {({ getFieldValue }) => {
                                return getFieldValue('cardType') === 'CREDIT' ? (
                                    <Form.Item
                                        name="requestedCreditLimit"
                                        label="申请信用额度"
                                        rules={[
                                            { required: true, message: '请输入申请的信用额度' },
                                            { type: 'number', min: 1000, message: '信用额度至少1000元' }
                                        ]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="输入申请的信用额度"
                                            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) || 0}
                                        />
                                    </Form.Item>
                                ) : null;
                            }}
                        </Form.Item>
                        
                        <Form.Item
                            name="preferredPassword"
                            label="首选6位数字密码"
                            rules={[
                                { required: true, message: '请输入密码' },
                                { pattern: /^\d{6}$/, message: '密码必须是6位数字' }
                            ]}
                        >
                            <Input.Password placeholder="输入6位数字密码" maxLength={6} />
                        </Form.Item>
                        <Form.Item name="applicationReason" label="申请原因">
                            <Input.TextArea rows={3} placeholder="请说明申请银行卡的原因" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                提交申请
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 信用卡还款Modal */}
                <Modal
                    title="信用卡还款"
                    open={isCreditPaymentModalVisible}
                    onCancel={() => setIsCreditPaymentModalVisible(false)}
                    footer={null}
                >
                    <Form onFinish={handleCreditCardPayment} layout="vertical">
                        <Form.Item name="creditCardNumber" initialValue={selectedAccount?.card_number} hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="paymentAmount" 
                            label="还款金额"
                            rules={[{ required: true, message: '请输入还款金额' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="输入还款金额"
                                max={selectedAccount?.outstandingBalance}
                            />
                        </Form.Item>
                        <Form.Item 
                            name="paymentMethod" 
                            label="还款方式"
                            rules={[{ required: true, message: '请选择还款方式' }]}
                            initialValue="CASH"
                        >
                            <Select>
                                <Select.Option value="CASH">现金还款</Select.Option>
                                <Select.Option value="DEBIT_CARD">储蓄卡还款</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => 
                                prevValues.paymentMethod !== currentValues.paymentMethod
                            }
                        >
                            {({ getFieldValue }) => {
                                return getFieldValue('paymentMethod') === 'DEBIT_CARD' ? (
                                    <Form.Item
                                        name="sourceDebitCardNumber"
                                        label="选择储蓄卡"
                                        rules={[{ required: true, message: '请选择储蓄卡' }]}
                                    >
                                        <Select placeholder="选择用于还款的储蓄卡">
                                            {accounts.filter(acc => (acc.cardType || 'DEBIT') === 'DEBIT').map(acc => (
                                                <Select.Option key={acc.card_number} value={acc.card_number}>
                                                    ****{acc.card_number.slice(-4)} (余额: ¥{acc.balance.toLocaleString()})
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                ) : null;
                            }}
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                确认还款
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 信用卡消费Modal */}
                <Modal
                    title="信用卡消费"
                    open={isCreditSpendModalVisible}
                    onCancel={() => setIsCreditSpendModalVisible(false)}
                    footer={null}
                >
                    <Form onFinish={handleCreditCardSpend} layout="vertical">
                        <Form.Item name="cardNumber" initialValue={selectedAccount?.card_number} hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="cvv" 
                            label="CVV安全码"
                            rules={[{ required: true, message: '请输入CVV码' }]}
                        >
                            <Input placeholder="输入3位CVV码" maxLength={3} />
                        </Form.Item>
                        <Form.Item 
                            name="amount" 
                            label="消费金额"
                            rules={[{ required: true, message: '请输入消费金额' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="输入消费金额"
                                max={selectedAccount?.availableCredit}
                            />
                        </Form.Item>
                        <Form.Item name="notes" label="消费说明">
                            <Input placeholder="输入消费说明" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                确认消费
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 贷款申请Modal */}
                <Modal
                    title="贷款申请"
                    open={isLoanApplicationModalVisible}
                    onCancel={() => setIsLoanApplicationModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    <Form onFinish={handleLoanApplication} layout="vertical">
                        <Form.Item 
                            name="requestedAmount" 
                            label="申请金额"
                            rules={[
                                { required: true, message: '请输入申请金额' },
                                { type: 'number', min: 1000, message: '申请金额至少1000元' }
                            ]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="输入申请金额"
                                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value ? parseFloat(value.replace(/¥\s?|(,*)/g, '')) : 0}
                            />
                        </Form.Item>
                        <Form.Item 
                            name="loanTermMonths" 
                            label="贷款期限（月）"
                            rules={[
                                { required: true, message: '请选择贷款期限' },
                                { type: 'number', min: 6, message: '贷款期限至少6个月' }
                            ]}
                        >
                            <Select placeholder="选择贷款期限">
                                <Select.Option value={6}>6个月</Select.Option>
                                <Select.Option value={12}>12个月</Select.Option>
                                <Select.Option value={24}>24个月</Select.Option>
                                <Select.Option value={36}>36个月</Select.Option>
                                <Select.Option value={60}>60个月</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item 
                            name="loanPurpose" 
                            label="贷款用途"
                            rules={[{ required: true, message: '请输入贷款用途' }]}
                        >
                            <Input placeholder="如：房屋装修、创业资金等" />
                        </Form.Item>
                        <Form.Item 
                            name="monthlyIncome" 
                            label="月收入"
                            rules={[{ required: true, message: '请输入月收入' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="输入月收入"
                                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value ? parseFloat(value.replace(/¥\s?|(,*)/g, '')) : 0}
                            />
                        </Form.Item>
                        <Form.Item 
                            name="existingDebt" 
                            label="现有债务（可选）"
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="输入现有债务金额"
                                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value ? parseFloat(value.replace(/¥\s?|(,*)/g, '')) : 0}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                提交申请
                            </Button>
                        </Form.Item>
                    </Form>
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
                    >
                        <Form.Item
                            label="选择银行卡"
                            name="cardNumber"
                            rules={[{ required: true, message: "请选择银行卡!" }]}
                        >
                            <Select
                                placeholder="请选择要修改密码的银行卡"
                                style={{ width: '100%' }}
                            >
                                {accounts.map((account) => (
                                    <Select.Option key={account.card_number} value={account.card_number}>
                                        <div>
                                            <span>{getCardTypeTag(account.cardType || 'DEBIT')} </span>
                                            <span>****{account.card_number.slice(-4)}</span>
                                            <span style={{ color: '#666', marginLeft: 8 }}>
                                                余额: ¥{account.balance?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                    </Select.Option>
                                ))}
                            </Select>
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
                                label="选择银行卡"
                                name="cardNumber"
                                rules={[{ required: true, message: "请选择银行卡!" }]}
                            >
                                <Select
                                    placeholder="请选择要重置密码的银行卡"
                                    style={{ width: '100%' }}
                                >
                                    {accounts.map((account) => (
                                        <Select.Option key={account.card_number} value={account.card_number}>
                                            <div>
                                                <span>{getCardTypeTag(account.cardType || 'DEBIT')} </span>
                                                <span>****{account.card_number.slice(-4)}</span>
                                                <span style={{ color: '#666', marginLeft: 8 }}>
                                                    余额: ¥{account.balance?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
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

                {/* 转账模态框 */}
                <Modal
                    title="转账"
                    open={isTransferModalVisible}
                    onCancel={() => setIsTransferModalVisible(false)}
                    footer={null}
                    width={500}
                >
                    <Form onFinish={handleTransfer} layout="vertical">
                        <Form.Item
                            label="从账户"
                            name="from_card_number"
                            initialValue={selectedAccount?.card_number}
                        >
                            <Input disabled />
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
                            <InputNumber 
                                style={{ width: '100%' }}
                                placeholder="请输入转账金额"
                                min={1}
                                precision={2}
                                addonBefore="¥"
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
                            label="备注"
                            name="notes"
                        >
                            <Input.TextArea 
                                placeholder="转账备注（可选）"
                                rows={3}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                确认转账
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 存款模态框 */}
                <Modal
                    title="存款"
                    open={isDepositModalVisible}
                    onCancel={() => setIsDepositModalVisible(false)}
                    footer={null}
                    width={400}
                >
                    <Form onFinish={handleDeposit} layout="vertical">
                        <Form.Item
                            label="银行卡号"
                            name="card_number"
                            initialValue={selectedAccount?.card_number}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            label="存款金额"
                            name="amount"
                            rules={[
                                { required: true, message: "请输入存款金额!" },
                                {
                                    validator: (_, value) => {
                                        const num = parseFloat(value);
                                        if (isNaN(num) || num <= 0) {
                                            return Promise.reject(new Error("存款金额必须大于0"));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }}
                                placeholder="请输入存款金额"
                                min={1}
                                precision={2}
                                addonBefore="¥"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                确认存款
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 取款模态框 */}
                <Modal
                    title="取款"
                    open={isWithdrawModalVisible}
                    onCancel={() => setIsWithdrawModalVisible(false)}
                    footer={null}
                    width={400}
                >
                    <Form onFinish={handleWithdraw} layout="vertical">
                        <Form.Item
                            label="银行卡号"
                            name="card_number"
                            initialValue={selectedAccount?.card_number}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            label="取款金额"
                            name="amount"
                            rules={[
                                { required: true, message: "请输入取款金额!" },
                                {
                                    validator: (_, value) => {
                                        const num = parseFloat(value);
                                        if (isNaN(num) || num <= 0) {
                                            return Promise.reject(new Error("取款金额必须大于0"));
                                        }
                                        if (selectedAccount && num > selectedAccount.balance) {
                                            return Promise.reject(new Error("余额不足"));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }}
                                placeholder="请输入取款金额"
                                min={1}
                                precision={2}
                                addonBefore="¥"
                            />
                        </Form.Item>

                        <Form.Item
                            label="银行卡密码"
                            name="password"
                            rules={[
                                { required: true, message: "请输入银行卡密码!" },
                                { len: 6, message: "密码必须是6位!" },
                                { pattern: /^\d{6}$/, message: "密码必须是数字!" }
                            ]}
                        >
                            <Input.Password 
                                placeholder="请输入6位银行卡密码"
                                maxLength={6}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                确认取款
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 贷款还款模态框 */}
                <Modal
                    title="贷款还款"
                    open={isLoanPaymentModalVisible}
                    onCancel={() => setIsLoanPaymentModalVisible(false)}
                    footer={null}
                    width={400}
                >
                    <Form 
                        onFinish={(values) => handleLoanPayment(selectedLoan?.id || 0, values.amount)}
                        layout="vertical"
                    >
                        <Form.Item label="贷款信息">
                            <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>
                                <p><strong>贷款用途：</strong>{selectedLoan?.loanPurpose}</p>
                                <p><strong>剩余欠款：</strong>¥{selectedLoan?.outstandingBalance.toLocaleString()}</p>
                                <p><strong>月还款额：</strong>¥{selectedLoan?.monthlyPayment.toLocaleString()}</p>
                            </div>
                        </Form.Item>

                        <Form.Item 
                            name="amount" 
                            label="还款金额"
                            rules={[
                                { required: true, message: '请输入还款金额' },
                                {
                                    validator: (_, value) => {
                                        const num = parseFloat(value);
                                        if (isNaN(num) || num <= 0) {
                                            return Promise.reject(new Error("还款金额必须大于0"));
                                        }
                                        if (selectedLoan && num > selectedLoan.outstandingBalance) {
                                            return Promise.reject(new Error("还款金额不能超过剩余欠款"));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="输入还款金额"
                                min={1}
                                max={selectedLoan?.outstandingBalance}
                                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value ? parseFloat(value.replace(/¥\s?|(,*)/g, '')) : 0}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                确认还款
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default EnhancedDashboard;