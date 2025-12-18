
export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string; // ISO Date string
  description: string;
  createdAt: number;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  currency: string;
  date: string;
  type: 'salary' | 'freelance' | 'gift' | 'other';
  notes?: string;
}

export interface Obligation {
  id: string;
  name: string;
  amount: number;
  currency: string;
  dueDate: string; // YYYY-MM-DD (Specific date)
  category: string; 
  active: boolean;
}

// Tracks if an obligation is paid for a specific month
export interface ObligationPayment {
  id: string;
  obligationId: string;
  monthKey: string; // "YYYY-MM"
  amountPaid: number;
  datePaid: string;
}

export interface OpeningSavings {
  year: number;
  cashUSD: number;
  usdToQarRate: number; // Fixed at 3.65
  goldGrams: number;
  goldPricePerGramQAR: number;
  totalOpeningQAR: number;
}

export interface AlertThresholds {
  warning: number; // e.g. 75%
  critical: number; // e.g. 90%
}

export interface Budget {
  limit: number;
  currency: string;
  categoryLimits: Record<string, number>;
  alertThresholds: AlertThresholds;
}

export type BudgetMap = Record<string, Budget>;

export interface YearlyStats {
  totalIncome: number;
  totalSpent: number; // Expenses + Paid Obligations
  totalSaved: number;
  openingSavings: number; // New
  totalWealth: number; // New (Opening + Saved)
  savingsRate: number;
  avgMonthlySavings: number;
  topCategories: { name: string; amount: number; percentage: number }[];
  worstMonth: { name: string; net: number } | null; // Net is income - spent
  bestMonth: { name: string; net: number } | null;
  trend: 'up' | 'down' | 'stable';
  recommendations: string[];
  currency: string;
}

// Interface for Gemini response when parsing natural language expenses
export interface ParsedExpenseResponse {
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string;
}

// Interface for Gemini response when analyzing monthly budget
export interface BudgetAnalysis {
  alertLevel: 'warning' | 'critical' | 'safe';
  summary: string;
  dailyAdjustment: string;
  topIssues: string[];
  recommendations: string[];
}
