import { describe, it, expect } from 'vitest';
import { buildTripSettlementSummaryText } from '../js/trip-stats.js';

describe('buildTripSettlementSummaryText', () => {
  it('含標題、成員、建議轉帳', () => {
    const trip = { name: '測試行', members: ['胡', '詹'] };
    const expenses = [
      {
        type: 'tripExpense',
        amount: 100,
        paidBy: '胡',
        splitAmong: ['胡', '詹'],
        _voided: false,
        date: '2024-01-15',
      },
    ];
    const text = buildTripSettlementSummaryText(trip, expenses);
    expect(text).toContain('【測試行】');
    expect(text).toContain('胡');
    expect(text).toContain('詹');
    expect(text).toContain('建議轉帳');
  });
});
