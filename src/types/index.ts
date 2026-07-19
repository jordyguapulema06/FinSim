export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark';
}

export type TransactionType = 'income' | 'expense' | 'savings' | 'debt_payment';

export interface Transaction {
  id: string;
  uid: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  isRecurring?: boolean;
}

export interface Goal {
  id: string;
  uid: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Debt {
  id: string;
  uid: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
}
