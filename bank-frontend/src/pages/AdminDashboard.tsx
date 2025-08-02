import React, { useEffect, useState } from "react";
import { Layout, Card, Table, Button, App, Tabs, Statistic, Row, Col, Tag, Switch, Modal, Form, Select, Input } from "antd";
import { UserOutlined, CreditCardOutlined, TransactionOutlined, BarChartOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminApi, applicationApi } from "../services/api";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

interface AdminUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    accountCount: number;
    totalBalance: number;
}

interface AdminAccount {
    id: number;
    cardNumber: string;
    balance: number;
    isActive: boolean;
    userName: string;
    userEmail: string;
    transactionCount: number;
}

interface SystemStatistics {
    totalUsers: number;
    activeUsers: number;
    totalAccounts: number;
    activeAccounts: number;
    totalTransactions: number;
    totalBalance: number;
    todayTransactionAmount: number;
    todayTransactionCount: number;
    totalTransferFees: number;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [accounts, setAccounts] = useState<AdminAccount[]>([]);
    const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [usersRes, accountsRes, statsRes, applicationsRes] = await Promise.all([
                adminApi.getAllUsers(),
                adminApi.getAllAccounts(),
                adminApi.getSystemStatistics(),
                applicationApi.getAllApplications()
            ]);

            if (usersRes.data.success) setUsers(usersRes.data.data);
            if (accountsRes.data.success) setAccounts(accountsRes.data.data);
            if (statsRes.data.success) setStatistics(statsRes.data.data);
            if (applicationsRes.data.success) setApplications(applicationsRes.data.data);
        } catch (error) {
            message.error("加载管理员数据失败");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessApplication = async (values: any) => {
        if (!selectedApplication) return;
        
        try {
            const response = await applicationApi.processApplication(selectedApplication.id, {
                status: values.status,
                adminNotes: values.adminNotes
            });
            
            if (response.data.success) {
                message.success(values.status === 'APPROVED' ? "申请已批准" : "申请已拒绝");
                setIsProcessModalVisible(false);
                loadAllData();
            }
        } catch (error) {
            message.error("处理申请失败");
        }
    };

    const handleUserToggle = async (userId: number, isActive: boolean) => {
        try {
            const response = isActive 
                ? await adminApi.unfreezeUser(userId)
                : await adminApi.freezeUser(userId);
            
            if (response.data.success) {
                message.success(isActive ? "用户已解冻" : "用户已冻结");
                loadAllData();
            }
        } catch (error) {
            message.error("操作失败");
        }
    };

    const handleAccountToggle = async (accountId: number, isActive: boolean) => {
        try {
            const response = isActive 
                ? await adminApi.unfreezeAccount(accountId)
                : await adminApi.freezeAccount(accountId);
            
            if (response.data.success) {
                message.success(isActive ? "账户已解冻" : "账户已冻结");
                loadAllData();
            }
        } catch (error) {
            message.error("操作失败");
        }
    };

    const userColumns = [
        { title: "用户ID", dataIndex: "id", key: "id" },
        { title: "姓名", dataIndex: "name", key: "name" },
        { title: "邮箱", dataIndex: "email", key: "email" },
        { title: "手机", dataIndex: "phone", key: "phone" },
        { 
            title: "角色", 
            dataIndex: "role", 
            key: "role",
            render: (role: string) => (
                <Tag color={role === "ADMIN" ? "red" : "blue"}>
                    {role === "ADMIN" ? "管理员" : "用户"}
                </Tag>
            )
        },
        { title: "账户数", dataIndex: "accountCount", key: "accountCount" },
        { 
            title: "总余额", 
            dataIndex: "totalBalance", 
            key: "totalBalance",
            render: (balance: number) => `¥${balance.toFixed(2)}`
        },
        {
            title: "状态",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean, record: AdminUser) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleUserToggle(record.id, checked)}
                    checkedChildren="正常"
                    unCheckedChildren="冻结"
                />
            )
        }
    ];

    const accountColumns = [
        { title: "账户ID", dataIndex: "id", key: "id" },
        { 
            title: "卡号", 
            dataIndex: "cardNumber", 
            key: "cardNumber",
            render: (cardNumber: string) => `****${cardNumber.slice(-4)}`
        },
        { title: "用户", dataIndex: "userName", key: "userName" },
        { title: "邮箱", dataIndex: "userEmail", key: "userEmail" },
        { 
            title: "余额", 
            dataIndex: "balance", 
            key: "balance",
            render: (balance: number) => `¥${balance.toFixed(2)}`
        },
        { title: "交易数", dataIndex: "transactionCount", key: "transactionCount" },
        {
            title: "状态",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean, record: AdminAccount) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleAccountToggle(record.id, checked)}
                    checkedChildren="正常"
                    unCheckedChildren="冻结"
                />
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
                    <BarChartOutlined style={{ color: "white", fontSize: "24px", marginRight: 8 }} />
                    <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                        系统管理
                    </span>
                </div>
                <Button 
                    type="text"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/login");
                    }}
                    style={{ color: "white" }}
                >
                    退出登录
                </Button>
            </Header>

            <Content style={{ padding: "24px" }}>
                <Tabs defaultActiveKey="statistics" size="large">
                    <TabPane
                        tab={
                            <span>
                                <BarChartOutlined />
                                系统统计
                            </span>
                        }
                        key="statistics"
                    >
                        {statistics && (
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title="总用户数"
                                            value={statistics.totalUsers}
                                            prefix={<UserOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title="活跃用户"
                                            value={statistics.activeUsers}
                                            valueStyle={{ color: "#3f8600" }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title="总账户数"
                                            value={statistics.totalAccounts}
                                            prefix={<CreditCardOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6}>
                                    <Card>
                                        <Statistic
                                            title="活跃账户"
                                            value={statistics.activeAccounts}
                                            valueStyle={{ color: "#3f8600" }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6} style={{ marginTop: 16 }}>
                                    <Card>
                                        <Statistic
                                            title="系统总余额"
                                            value={statistics.totalBalance}
                                            precision={2}
                                            prefix="¥"
                                            valueStyle={{ color: "#1890ff" }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6} style={{ marginTop: 16 }}>
                                    <Card>
                                        <Statistic
                                            title="总交易数"
                                            value={statistics.totalTransactions}
                                            prefix={<TransactionOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6} style={{ marginTop: 16 }}>
                                    <Card>
                                        <Statistic
                                            title="今日交易额"
                                            value={statistics.todayTransactionAmount}
                                            precision={2}
                                            prefix="¥"
                                            valueStyle={{ color: "#cf1322" }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={6} style={{ marginTop: 16 }}>
                                    <Card>
                                        <Statistic
                                            title="今日交易数"
                                            value={statistics.todayTransactionCount}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <UserOutlined />
                                用户管理
                            </span>
                        }
                        key="users"
                    >
                        <Card>
                            <Table
                                columns={userColumns}
                                dataSource={users}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `共 ${total} 名用户`,
                                }}
                            />
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <FileTextOutlined />
                                申请管理
                            </span>
                        }
                        key="applications"
                    >
                        <Card>
                            <Table
                                columns={[
                                    { title: "申请ID", dataIndex: "id", key: "id" },
                                    { title: "用户", dataIndex: "userName", key: "userName" },
                                    { title: "邮箱", dataIndex: "userEmail", key: "userEmail" },
                                    { title: "申请原因", dataIndex: "applicationReason", key: "applicationReason", 
                                      render: (reason: string) => reason?.substring(0, 50) + (reason?.length > 50 ? "..." : "") },
                                    { title: "申请时间", dataIndex: "applicationDate", key: "applicationDate",
                                      render: (date: string) => new Date(date).toLocaleString() },
                                    { 
                                        title: "状态", 
                                        dataIndex: "status", 
                                        key: "status",
                                        render: (status: string) => {
                                            const colors = { PENDING: "orange", APPROVED: "green", REJECTED: "red" };
                                            const texts = { PENDING: "待审核", APPROVED: "已批准", REJECTED: "已拒绝" };
                                            return <Tag color={colors[status as keyof typeof colors]}>{texts[status as keyof typeof texts]}</Tag>;
                                        }
                                    },
                                    {
                                        title: "操作",
                                        key: "action",
                                        render: (_, record: any) => (
                                            record.status === 'PENDING' ? (
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedApplication(record);
                                                        setIsProcessModalVisible(true);
                                                    }}
                                                >
                                                    处理
                                                </Button>
                                            ) : (
                                                <span>已处理</span>
                                            )
                                        )
                                    }
                                ]}
                                dataSource={applications}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `共 ${total} 个申请`,
                                }}
                            />
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <CreditCardOutlined />
                                账户管理
                            </span>
                        }
                        key="accounts"
                    >
                        <Card>
                            <Table
                                columns={accountColumns}
                                dataSource={accounts}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `共 ${total} 个账户`,
                                }}
                            />
                        </Card>
                    </TabPane>
                </Tabs>
            </Content>

            {/* 处理申请模态框 */}
            <Modal
                title="处理银行卡申请"
                open={isProcessModalVisible}
                onCancel={() => setIsProcessModalVisible(false)}
                footer={null}
                width={500}
            >
                {selectedApplication && (
                    <div>
                        <div style={{ marginBottom: 16, background: "#f5f5f5", padding: 16, borderRadius: 4 }}>
                            <h4>申请信息</h4>
                            <p><strong>申请人：</strong>{selectedApplication.userName}</p>
                            <p><strong>邮箱：</strong>{selectedApplication.userEmail}</p>
                            <p><strong>电话：</strong>{selectedApplication.userPhone}</p>
                            <p><strong>申请时间：</strong>{new Date(selectedApplication.applicationDate).toLocaleString()}</p>
                            <p><strong>申请原因：</strong>{selectedApplication.applicationReason}</p>
                        </div>

                        <Form
                            layout="vertical"
                            onFinish={handleProcessApplication}
                        >
                            <Form.Item
                                label="处理决定"
                                name="status"
                                rules={[{ required: true, message: "请选择处理决定!" }]}
                            >
                                <Select placeholder="请选择处理决定">
                                    <Select.Option value="APPROVED">批准</Select.Option>
                                    <Select.Option value="REJECTED">拒绝</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="管理员备注"
                                name="adminNotes"
                                rules={[{ max: 500, message: "备注不能超过500字符!" }]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="请输入处理备注..."
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    确认处理
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default AdminDashboard;