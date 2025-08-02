import React from "react";
import { Layout, Form, Input, Button, Card, App } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { LoginRequest } from "../types";
import { authApi } from "../services/api";

const { Header, Content } = Layout;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();

    const onFinish = async (values: LoginRequest) => {
        try {
            const response = await authApi.login(values);
            if (response.data.success) {
                localStorage.setItem("token", response.data.data.token);
                message.success("登录成功");
                
                // 检查是否为管理员
                const token = response.data.data.token;
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.sub === 'admin@bank.com') {
                        navigate("/admin");
                    } else {
                        navigate("/dashboard");
                    }
                } catch (error) {
                    console.error("Failed to parse token:", error);
                    navigate("/dashboard");
                }
            } else {
                // 处理后端返回的业务错误
                const errorMsg = response.data.errors || "登录失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            // 处理HTTP错误和异常
            let errorMessage = "登录失败，请检查邮箱和密码";
            
            if (error.response) {
                // 后端返回的错误响应
                const { status, data } = error.response;
                
                if (data && data.errors) {
                    if (typeof data.errors === 'string') {
                        errorMessage = data.errors;
                    } else if (typeof data.errors === 'object') {
                        // 处理验证错误对象
                        const errorValues = Object.values(data.errors);
                        errorMessage = errorValues.join(', ');
                    }
                } else {
                    // 根据HTTP状态码提供更具体的错误信息
                    switch (status) {
                        case 401:
                            errorMessage = "邮箱或密码错误";
                            break;
                        case 404:
                            errorMessage = "用户不存在";
                            break;
                        case 400:
                            errorMessage = "请检查输入信息是否正确";
                            break;
                        case 500:
                            errorMessage = "服务器内部错误，请稍后重试";
                            break;
                        default:
                            errorMessage = `登录失败 (错误码: ${status})`;
                    }
                }
            } else if (error.request) {
                // 网络错误
                errorMessage = "网络连接失败，请检查网络连接";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            message.error(errorMessage);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ 
                backgroundColor: "#1890ff", 
                display: "flex", 
                alignItems: "center",
                justifyContent: "center" 
            }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <BankOutlined style={{ color: "white", fontSize: "24px", marginRight: 8 }} />
                    <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                        银行管理系统
                    </span>
                </div>
            </Header>
            
            <Content style={{ 
                padding: "24px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
            }}>
                <Card title="用户登录" style={{ width: 400 }}>
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[
                            { required: true, message: "请输入邮箱" },
                            { type: "email", message: "请输入有效的邮箱地址" }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: "请输入密码" }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            登录
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center" }}>
                        还没有账号？ <Link to="/register">立即注册</Link>
                    </div>
                </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Login;
