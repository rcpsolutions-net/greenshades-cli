export interface DirectDepositEntry {
  ordinal?: number;
  routingNumber: string;
  accountNumber: string;
  amount?: number;
  percent?: number;
  accountType: 'Checking' | 'Savings';
  isRemainder: boolean;
  isPrenote?: boolean;
  paycardType?: 'rapid!' | null;
}
