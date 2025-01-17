export interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface User {
  id: number;
  role: string;
  email: string;
  full_name: string;
  username: string;
  balance: number;
  crypto_balance?: number;
  referral_code: string | null;
  total_referrals: number;
  referral_reward: number;
  created_at: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface ErrorResponse {
  message: string;
  status?: number;
  error?: string;
}

export interface Balance {
  id: number;
  user_id: number;
  balance: number;
  crypto_balance?: number;
}

export interface Transactions {
  id: number;
  user_id: number;
  amount: number;
  account_name: string;
  account_number: string;
  transaction_type: string;
  created_at: string; // ISO 8601 formatted string
  updated_at: string; // ISO 8601 formatted string
}
export interface Crypto {
  id: number;
  user_id: number;
  amount: number;
  crypto_name: string;
  account_address: string;
}

export interface CryptoHistory {
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  closePrice?: number;

  id: number;
  user_id: number;
  amount: number;
  crypto_name: string;
  account_address: string;
  created_at: string; // ISO 8601 formatted string
  data?: CandlestickChartProps;
}

export interface TransactionHistory {
  id: number;
  user_id: number;
  amount: number;
  account_name: string;
  account_number: string;
  transaction_type: string;
  created_at: string; // ISO 8601 formatted string
  updated_at: string; // ISO 8601 formatted string
}

export interface DashboardData {
  user: User;
  transactions: TransactionHistory[];
}

export type Referrals = User[];

export interface AccountDetailFullList {
  id: number;
  user_id: number;
  BTCAddress: string;
  BTCAddressSeed: string;
  ETHAddress: string;
  ETHAddressSeed: string;
  LTCAddress: string;
  LTCAddressSeed: string;
  USDCAddress: string;
  USDCAddressSeed: string;
  PDESAddres: string;
}

export interface AccountDetail {
  id: number;
  user_id?: number;
  BTC: string;
  ETH: string;
  LTC: string;
  USDC: string;
  PDES?: string;
}

export interface DepositType {
  id: number;
  bank_name: string | number;
  account_name: string;
  account_number: string;
  amount: number;
  account_type: string;
}

export interface ResetPassword {
  email?: string;
  token?: string;
  password?: string;
  newPassword?: string;
}

export interface AccountDetails {
  accountName: string;
  accountNumber?: string;
  accountType: string;
  amount: number;
  btcAddress?: string;
  type: string;
}

export interface CandlestickChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}
export interface DepositAccountProps {
  id?: number;
  user_id?: User["id"];
  bank_name?: string;
  account_name: string;
  account_number: string;
  amount: number;
  account_type: string;
  max_deposit_amount:  number;
}
