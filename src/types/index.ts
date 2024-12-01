export interface Earning {
  id: string;
  date: string;
  customerName: string;
  customerLocation: string;
  category: 'Repair' | 'Installation' | 'Tips' | 'Other';
  description: string;
  timeWorked: number;
  timeAmount: number;
  materialAmount: number;
  tips: number;
  totalEarnings: number;
  createdAt: string;
}

export interface UserMetadata {
  totalCurrentMonthEarnings: number;
  totalPreviousMonthEarnings: number;
  totalCurrentYearEarnings: number;
}
