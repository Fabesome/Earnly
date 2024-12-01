export interface Earning {
    id?: string;
    date: string;
    customerName: string;
    customerLocation: string;
    category: 'reparatur' | 'montage' | 'trinkgeld' | 'sonstiges';
    description: string;
    timeWorked: number;
    tips: number;
    totalEarnings: number;
    createdAt: Date;
  }