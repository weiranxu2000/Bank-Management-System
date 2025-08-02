import axios from "axios";
import { 
    LoginRequest, 
    RegisterRequest, 
    DepositRequest, 
    WithdrawRequest,
    TransferRequest,
    TransferResponse,
    ApiResponse,
    User,
    Account,
    Transaction,
    TransactionHistory,
    CreditCardPaymentRequest,
    LoanApplicationRequest,
    LoanApplicationResponse,
    LoanInfo
} from "../types";

const api = axios.create({
    baseURL: "http://localhost:8080"
});

// 请求拦截器，添加token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        // 确保token格式正确
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = formattedToken;
    }
    return config;
});

// 认证相关API
export const authApi = {
    login: (data: LoginRequest) => 
        api.post<ApiResponse<{ token: string }>>("/auth/login", data),
    
    register: (data: RegisterRequest) =>
        api.post<ApiResponse<{ token: string }>>("/auth/register", data)
};

// 账户相关API
export const accountApi = {
    getAccounts: () => 
        api.get<ApiResponse<Account[]>>("/account"),
    
    createAccount: () =>
        api.post<ApiResponse<Account>>("/account")
};

// 交易相关API
export const transactionApi = {
    deposit: (data: DepositRequest) =>
        api.post<ApiResponse<Transaction>>("/transaction/deposit", data),
    
    withdraw: (data: WithdrawRequest) =>
        api.post<ApiResponse<Transaction>>("/transaction/withdraw", data),
    
    transfer: (data: TransferRequest) =>
        api.post<ApiResponse<TransferResponse>>("/transaction/transfer", data),
    
    getTransactions: (accountId: number) =>
        api.get<ApiResponse<Transaction[]>>(`/transaction/${accountId}`),
    
    // 获取用户所有交易历史
    getUserTransactionHistory: () =>
        api.get<ApiResponse<TransactionHistory[]>>("/transaction/history"),
    
    // 获取指定账户的交易历史
    getAccountTransactionHistory: (accountId: number) =>
        api.get<ApiResponse<TransactionHistory[]>>(`/transaction/history/${accountId}`)
};

// 管理员相关API
export const adminApi = {
    getAllUsers: () =>
        api.get<ApiResponse<any[]>>("/admin/users"),
    
    getAllAccounts: () =>
        api.get<ApiResponse<any[]>>("/admin/accounts"),
    
    getAllTransactions: () =>
        api.get<ApiResponse<TransactionHistory[]>>("/admin/transactions"),
    
    getSystemStatistics: () =>
        api.get<ApiResponse<any>>("/admin/statistics"),
    
    freezeUser: (userId: number) =>
        api.put<ApiResponse<any>>(`/admin/users/${userId}/freeze`),
    
    unfreezeUser: (userId: number) =>
        api.put<ApiResponse<any>>(`/admin/users/${userId}/unfreeze`),
    
    freezeAccount: (accountId: number) =>
        api.put<ApiResponse<any>>(`/admin/accounts/${accountId}/freeze`),
    
    unfreezeAccount: (accountId: number) =>
        api.put<ApiResponse<any>>(`/admin/accounts/${accountId}/unfreeze`)
};

// 银行卡申请相关API
export const applicationApi = {
    submitApplication: (data: any) =>
        api.post<ApiResponse<any>>("/application/submit", data),
    
    getUserApplications: () =>
        api.get<ApiResponse<any[]>>("/application/user"),
    
    getAllApplications: () =>
        api.get<ApiResponse<any[]>>("/application/all"),
    
    getPendingApplications: () =>
        api.get<ApiResponse<any[]>>("/application/pending"),
    
    processApplication: (applicationId: number, data: any) =>
        api.post<ApiResponse<any>>(`/application/${applicationId}/process`, data)
};

// 密码管理相关API
export const passwordApi = {
    changePassword: (data: any) =>
        api.post<ApiResponse<any>>("/password/change", data),
    
    sendVerificationCode: (data: any) =>
        api.post<ApiResponse<any>>("/password/forgot/send-code", data),
    
    verifyCodeAndResetPassword: (data: any) =>
        api.post<ApiResponse<any>>("/password/forgot/verify", data)
};

// 信用卡相关API
export const creditCardApi = {
    makePayment: (data: CreditCardPaymentRequest) =>
        api.post<ApiResponse<any>>("/credit-card/payment", data),
    
    creditCardSpend: (cardNumber: string, cvv: string, amount: number, notes?: string) =>
        api.post<ApiResponse<any>>("/credit-card/spend", null, {
            params: { cardNumber, cvv, amount, notes }
        })
};

// 贷款相关API
export const loanApi = {
    applyLoan: (data: LoanApplicationRequest) =>
        api.post<ApiResponse<LoanApplicationResponse>>("/loan/apply", data),
    
    getUserApplications: () =>
        api.get<ApiResponse<LoanApplicationResponse[]>>("/loan/user-applications"),
    
    getUserLoans: () =>
        api.get<ApiResponse<LoanInfo[]>>("/loan/user-loans"),
    
    makeLoanPayment: (loanId: number, amount: number) =>
        api.post<ApiResponse<any>>(`/loan/${loanId}/payment`, null, {
            params: { amount }
        }),
        
    getAllApplications: () =>
        api.get<ApiResponse<LoanApplicationResponse[]>>("/loan/all-applications"),
        
    getPendingApplications: () =>
        api.get<ApiResponse<LoanApplicationResponse[]>>("/loan/pending-applications"),
        
    processApplication: (applicationId: number, data: any) =>
        api.post<ApiResponse<LoanApplicationResponse>>(`/loan/${applicationId}/process`, data)
};
