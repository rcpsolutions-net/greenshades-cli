import type { DirectDepositEntry } from './types.ts';

export function formatErrorMessage(error: any): string {
  if (error.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    return JSON.stringify(error.response.data, null, 2);
  }
  return error.message || 'Unknown error';
}

export function validateRoutingNumber(routing: string): boolean {
  return /^\d{9}$/.test(routing.trim());
}

export function validateEntries(entries: DirectDepositEntry[]): void {
  if (!Array.isArray(entries)) {
    throw new Error('Direct deposit payload must be an array of entries.');
  }

  let remainderCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const indexStr = `Entry #${i + 1}`;

    if (!entry.routingNumber || !validateRoutingNumber(String(entry.routingNumber))) {
      throw new Error(`${indexStr}: Routing number must be exactly 9 digits (got "${entry.routingNumber}").`);
    }

    if (!entry.accountNumber || String(entry.accountNumber).trim().length === 0) {
      throw new Error(`${indexStr}: Account number is required.`);
    }

    if (String(entry.accountNumber).length > 25) {
      throw new Error(`${indexStr}: Account number cannot exceed 25 characters.`);
    }

    const type = String(entry.accountType).toLowerCase();
    if (type !== 'checking' && type !== 'savings') {
      throw new Error(`${indexStr}: Account type must be either 'Checking' or 'Savings' (got "${entry.accountType}").`);
    }

    if (entry.isRemainder) {
      remainderCount++;
    }

    // Default ordinal if missing
    if (entry.ordinal === undefined || entry.ordinal === null) {
      entry.ordinal = i + 1;
    }
  }

  if (remainderCount > 1) {
    throw new Error('Only one entry may be designated as the remainder entry.');
  }
}
