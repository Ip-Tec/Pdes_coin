export interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface User {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
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
