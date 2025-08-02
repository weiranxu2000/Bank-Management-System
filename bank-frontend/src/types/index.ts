// 用户相关类型
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}

// 账户相关类型
export interface Account {
    id?: number;
    card_number: string;
    password: string;
    balance: number;
    cardType?: 'DEBIT' | 'CREDIT';
    cvv?: string;
    creditLimit?: number;
    availableCredit?: number;
    outstandingBalance?: number;
    lastPaymentDate?: string;
}

// 交易相关类型
export interface Transaction {
    id: number;
    type: "DEPOSIT" | "WITHDRAW";
    amount: number;
    notes?: string;
    timestamp: string;
    accountId: number;
}

// 交易历史响应类型
export interface TransactionHistory {
    id: number;
    type: "DEPOSIT" | "WITHDRAW" | "TRANSFER";
    amount: number;
    notes?: string;
    timestamp: string;
    card_number: string;
    balance_after: number;
}

// API请求类型
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
}

export interface DepositRequest {
    card_number: string;
    amount: number;
}

export interface WithdrawRequest {
    card_number: string;
    password: string;
    amount: number;
}

export interface TransferRequest {
    from_card_number: string;
    to_card_number: string;
    password: string;
    amount: number;
    notes?: string;
}

export interface TransferResponse {
    transfer_id: number;
    from_card_number: string;
    to_card_number: string;
    amount: number;
    transfer_fee: number;
    from_balance_after: number;
    notes?: string;
    timestamp: string;
}

// 信用卡支付相关
export interface CreditCardPaymentRequest {
    creditCardNumber: string;
    paymentAmount: number;
    sourceDebitCardNumber?: string;
    paymentMethod: 'DEBIT_CARD' | 'CASH';
}

// 贷款相关
export interface LoanApplicationRequest {
    requestedAmount: number;
    loanTermMonths: number;
    loanPurpose: string;
    monthlyIncome: number;
    existingDebt?: number;
}

export interface LoanApplicationResponse {
    id: number;
    userName: string;
    userEmail: string;
    requestedAmount: number;
    loanTermMonths: number;
    loanPurpose: string;
    monthlyIncome: number;
    existingDebt: number;
    calculatedCreditScore: number;
    approvedAmount?: number;
    monthlyPayment?: number;
    interestRate?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    applicationDate: string;
    processedDate?: string;
    processedByName?: string;
    adminNotes?: string;
}

export interface LoanInfo {
    id: number;
    principalAmount: number;
    outstandingBalance: number;
    monthlyPayment: number;
    interestRate: number;
    remainingTerms: number;
    nextPaymentDate: string;
    loanPurpose: string;
}

// API响应类型
export interface ApiResponse<T> {
    status: number;
    success: boolean;
    data: T;
    errors?: any; // 错误信息，可以是字符串或对象
}
