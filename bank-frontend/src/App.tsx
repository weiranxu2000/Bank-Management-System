import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EnhancedDashboard from './pages/EnhancedDashboard';
import TransactionHistory from './pages/TransactionHistory';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <BrowserRouter>
          <Layout style={{ minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={
            <PrivateRoute>
              <EnhancedDashboard />
            </PrivateRoute>
          } />
          <Route path="/transaction-history" element={
            <PrivateRoute>
              <TransactionHistory />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;