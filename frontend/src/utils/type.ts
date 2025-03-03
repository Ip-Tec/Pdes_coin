export interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string | number; // Adjusted to allow numbers as well
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  placeholder?: string;
  error?: string;
  required?: boolean | undefined;
  icon?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]:
    | string
    | number
    | undefined
    | boolean
    | React.ReactNode
    | ((e: React.ChangeEvent<HTMLInputElement>) => void);
}

export interface User {
  id: number;
  role: string;
  email: string;
  full_name: string;
  username: string;
  balance: Balance;
  reward_rate: number;
  crypto_balance?: number;
  referral_code: string | null;
  total_referrals: number;
  referrer_id?: number;
  sticks?: number;
  is_blocked?: boolean;
  correct_balance?: number;
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
  balance: number;
  crypto_balance: number;
  rewards_earned: number;
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
  created_at?: string; // ISO 8601 formatted string
  updated_at?: string; // ISO 8601 formatted string
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
  max_deposit_amount: number;
}

export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface ForgetPassword {
  email: string;
}

export interface ResetPassword {
  email: string;
  token: string;
  password: string;
  newPassword: string;
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
  max_deposit_amount: number;
}

export interface UtilityProps {
  pdes_buy_price: string;
  pdes_sell_price: string;
  pdes_market_cap?: string;
  pdes_circulating_supply: string;
  conversion_rate: string;
  reward_percentage: string;
  referral_percentage: string;
  pdes_supply_left: string;
  pdes_total_supply: string;
}

export interface DepositPropsWithUser {
  id: number;
  user: User;
  amount: number;
  status: string;
  user_id: number;
  currency: string;
  updated_at: string;
  created_at: string;
  transaction_id: string;
  deposit_method: string;
  session_id: string | null;
}

export interface RewardSettingFormData {
  weekly_percentage: number;
  start_date: string;
  end_date?: string;
}

export interface TradeHistory {
  buy: number;
  time: string;
  sell: number;
  amount: number;
  created_at: string;
  updated_at: string;
  transaction_type: string;
}

export interface PriceData {
  time: string;
  buy: number;
  sell: number;
}

export interface LiveChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: PriceData[];
    borderColor: string;
    fill: boolean;
  }[];
}

export interface TradePrice {
  pdes_buy_price: number;
  pdes_sell_price: number;
  pdes_market_cap: number;
  pdes_circulating_supply: number;
  pdes_supply_left: number;
  pdes_total_supply: number;
  error?: string;
}

export interface confirmUserDepositProps {
  id: number;
  role?: string;
  email?: string;
  full_name?: string;
  username?: string;
  balance?: number;
  crypto_balance?: number | undefined;
  referral_code?: string | null;
  total_referrals?: number;
  sticks?: number;
  is_blocked?: boolean;
  correct_balance?: number;
  referral_reward?: number;
  user?: User;
  amount: number | false;
  status?: string;
  user_id: number | string;
  currency?: string;
  updated_at?: string;
  created_at?: string;
  transaction_id?: string;
  deposit_method?: string;
  session_id?: string | null;
  crypto_name: string;
  account_name: string;
  account_number: string;
  transaction_type: string;
}

