import React, { useEffect, useState } from "react";
import { Layout, Card, Table, Tag, DatePicker, Select, Button, App, Collapse, Statistic, Row, Col } from "antd";
import { HistoryOutlined, ArrowLeftOutlined, CreditCardOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TransactionHistory, Account } from "../types";
import { transactionApi, accountApi } from "../services/api";
import dayjs from "dayjs";

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactionsByAccount, setTransactionsByAccount] = useState<{[key: string]: TransactionHistory[]}>({});
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<string>("ALL");
    const [maskCardNumbers, setMaskCardNumbers] = useState<boolean>(true);

    useEffect(() => {
        loadAccountsAndTransactionHistory();
    }, []);

    const loadAccountsAndTransactionHistory = async () => {
        setLoading(true);
        try {
            // 获取用户所有账户
            const accountsResponse = await accountApi.getAccounts();
            if (accountsResponse.data.success) {
                const accountsData = accountsResponse.data.data;
                setAccounts(accountsData);
                
                // 为每个账户获取交易历史
                const transactionsByAccountData: {[key: string]: TransactionHistory[]} = {};
                
                // 暂时使用getUserTransactionHistory获取所有交易，然后按卡号分组
                const allTransactionsResponse = await transactionApi.getUserTransactionHistory();
                if (allTransactionsResponse.data.success) {
                    const allTransactions = allTransactionsResponse.data.data;
                    
                    // 按卡号分组交易记录
                    for (const account of accountsData) {
                        transactionsByAccountData[account.card_number] = allTransactions.filter(
                            transaction => transaction.card_number === account.card_number
                        );
                    }
                }
                
                setTransactionsByAccount(transactionsByAccountData);
            }
        } catch (error) {
            message.error("获取账户和交易历史失败");
        } finally {
            setLoading(false);
        }
    };

    const formatCardNumber = (cardNumber: string) => {
        if (maskCardNumbers && cardNumber.length >= 4) {
            return `****${cardNumber.slice(-4)}`;
        }
        return cardNumber;
    };

    const getFilteredTransactions = (transactions: TransactionHistory[]) => {
        if (filterType === "ALL") {
            return transactions;
        }
        return transactions.filter(t => t.type === filterType);
    };

    const columns = [
        {
            title: "交易时间",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp: string) => dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss"),
            sorter: (a: TransactionHistory, b: TransactionHistory) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        },
        {
            title: "交易类型",
            dataIndex: "type",
            key: "type",
            render: (type: string) => {
                let color = "blue";
                let text = "未知";
                
                if (type === "DEPOSIT") {
                    color = "green";
                    text = "存款";
                } else if (type === "WITHDRAW") {
                    color = "red";
                    text = "取款";
                } else if (type === "TRANSFER") {
                    color = "orange";
                    text = "转账";
                }
                
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "金额",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number, record: TransactionHistory) => {
                let color = "#666";
                let prefix = "";
                
                if (record.type === "DEPOSIT") {
                    color = "#52c41a";
                    prefix = "+";
                } else if (record.type === "WITHDRAW") {
                    color = "#ff4d4f";
                    prefix = "-";
                } else if (record.type === "TRANSFER") {
                    color = "#fa8c16";
                    prefix = "-";
                }
                
                return (
                    <span style={{ color }}>
                        {prefix}¥{amount.toFixed(2)}
                    </span>
                );
            },
        },
        {
            title: "银行卡号",
            dataIndex: "card_number",
            key: "card_number",
            render: (cardNumber: string) => 
                `****${cardNumber.slice(-4)}`,
        },
        {
            title: "交易后余额",
            dataIndex: "balance_after",
            key: "balance_after",
            render: (balance: number) => `¥${balance.toFixed(2)}`,
        },
        {
            title: "备注",
            dataIndex: "notes",
            key: "notes",
            render: (notes: string) => notes || "-",
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
                    <Button 
                        type="text" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate("/dashboard")}
                        style={{ color: "white", marginRight: 16 }}
                    >
                        返回
                    </Button>
                    <HistoryOutlined style={{ color: "white", fontSize: "24px", marginRight: 8 }} />
                    <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                        交易历史
                    </span>
                </div>
            </Header>

            <Content style={{ padding: "24px" }}>
                <Card>
                    <div style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <span>筛选条件：</span>
                        <Select 
                            value={filterType} 
                            onChange={setFilterType}
                            style={{ width: 120 }}
                        >
                            <Option value="ALL">全部</Option>
                            <Option value="DEPOSIT">存款</Option>
                            <Option value="WITHDRAW">取款</Option>
                            <Option value="TRANSFER">转账</Option>
                        </Select>
                        
                        <Button 
                            type={maskCardNumbers ? "default" : "primary"}
                            icon={maskCardNumbers ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            onClick={() => setMaskCardNumbers(!maskCardNumbers)}
                        >
                            {maskCardNumbers ? "显示完整卡号" : "隐藏卡号"}
                        </Button>
                        
                        <Button onClick={loadAccountsAndTransactionHistory} loading={loading}>
                            刷新
                        </Button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "50px" }}>
                            加载中...
                        </div>
                    ) : accounts.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "50px" }}>
                            暂无银行卡
                        </div>
                    ) : (
                        <Collapse
                            defaultActiveKey={accounts.map(account => account.card_number)}
                            items={accounts.map(account => {
                                const transactions = getFilteredTransactions(transactionsByAccount[account.card_number] || []);
                                const totalIncome = transactions
                                    .filter(t => t.type === "DEPOSIT")
                                    .reduce((sum, t) => sum + t.amount, 0);
                                const totalExpense = transactions
                                    .filter(t => t.type === "WITHDRAW" || t.type === "TRANSFER")
                                    .reduce((sum, t) => sum + t.amount, 0);

                                return {
                                    key: account.card_number,
                                    label: (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <CreditCardOutlined style={{ fontSize: 18, color: "#1890ff" }} />
                                                <span style={{ fontWeight: "bold", fontSize: 16 }}>
                                                    {formatCardNumber(account.card_number)}
                                                </span>
                                                <Tag color="blue">余额: ¥{account.balance.toFixed(2)}</Tag>
                                            </div>
                                            <div style={{ display: "flex", gap: 16, marginRight: 24 }}>
                                                <Statistic
                                                    title="收入"
                                                    value={totalIncome}
                                                    precision={2}
                                                    prefix="¥"
                                                    valueStyle={{ color: "#3f8600", fontSize: 14 }}
                                                />
                                                <Statistic
                                                    title="支出"
                                                    value={totalExpense}
                                                    precision={2}
                                                    prefix="¥"
                                                    valueStyle={{ color: "#cf1322", fontSize: 14 }}
                                                />
                                                <Statistic
                                                    title="交易数"
                                                    value={transactions.length}
                                                    valueStyle={{ color: "#722ed1", fontSize: 14 }}
                                                />
                                            </div>
                                        </div>
                                    ),
                                    children: (
                                        <Table
                                            columns={columns}
                                            dataSource={transactions}
                                            rowKey="id"
                                            pagination={{
                                                pageSize: 8,
                                                showSizeChanger: false,
                                                showQuickJumper: true,
                                                showTotal: (total) => `共 ${total} 条交易记录`,
                                                size: "small"
                                            }}
                                            size="small"
                                            scroll={{ x: 800 }}
                                            locale={{ emptyText: "暂无交易记录" }}
                                        />
                                    )
                                };
                            })}
                        />
                    )}
                </Card>
            </Content>
        </Layout>
    );
};

export default TransactionHistoryPage;