import React from "react";
import { Layout, Form, Input, Button, Card, App } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { RegisterRequest } from "../types";
import { authApi } from "../services/api";

const { Header, Content } = Layout;

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();

    const onFinish = async (values: RegisterRequest) => {
        try {
            const response = await authApi.register(values);
            if (response.data.success) {
                const token = response.data.data.token;
                if (token) {
                    localStorage.setItem("token", token);
                    message.success("注册成功");
                    // 确保token已经保存后再跳转
                    setTimeout(() => {
                        navigate("/dashboard");
                    }, 100);
                } else {
                    message.error("注册成功但未获取到token");
                }
            } else {
                // 处理后端返回的业务错误
                const errorMsg = response.data.errors || "注册失败";
                message.error(errorMsg);
            }
        } catch (error: any) {
            // 处理HTTP错误和异常
            let errorMessage = "注册失败，请稍后重试";
            
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
                        case 409:
                            errorMessage = "邮箱或手机号已存在";
                            break;
                        case 400:
                            errorMessage = "请检查输入信息是否正确";
                            break;
                        case 500:
                            errorMessage = "服务器内部错误，请稍后重试";
                            break;
                        default:
                            errorMessage = `注册失败 (错误码: ${status})`;
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
                <Card title="用户注册" style={{ width: 400 }}>
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="姓名"
                        name="name"
                        rules={[{ required: true, message: "请输入姓名" }]}
                    >
                        <Input />
                    </Form.Item>

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
                        label="手机号"
                        name="phone"
                        rules={[
                            { required: true, message: "请输入手机号" },
                            { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[
                            { required: true, message: "请输入密码" },
                            { min: 6, message: "密码长度不能小于6位" }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            注册
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: "center" }}>
                        已有账号？ <Link to="/login">立即登录</Link>
                    </div>
                </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Register;
