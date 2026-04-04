import { describe, it, expect } from 'vitest';
import {
  addDaysTaipei,
  buildCalendarGridCells,
  daysInMonth,
  getMondayOfWeekContaining,
  getSundayOfWeekContaining,
  parseYm,
  shiftYm,
  weekdayTaipeiSundayZero,
} from '../js/time.js';

describe('parseYm / shiftYm / daysInMonth', () => {
  it('parses YYYY-MM', () => {
    expect(parseYm('2026-04')).toEqual({ y: 2026, m: 4 });
  });

  it('shifts across year boundary', () => {
    expect(shiftYm('2026-01', -1)).toBe('2025-12');
    expect(shiftYm('2025-12', 1)).toBe('2026-01');
  });

  it('daysInMonth matches calendar', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
  });
});

describe('weekdayTaipeiSundayZero', () => {
  it('2025-04-01 is Tuesday (2)', () => {
    expect(weekdayTaipeiSundayZero(2025, 4, 1)).toBe(2);
  });
});

describe('addDaysTaipei / getMondayOfWeekContaining', () => {
  it('addDaysTaipei crosses month boundary', () => {
    expect(addDaysTaipei('2025-04-30', 1)).toBe('2025-05-01');
  });

  it('Monday of week containing 2025-04-01 is 2025-03-31', () => {
    expect(getMondayOfWeekContaining('2025-04-01')).toBe('2025-03-31');
  });

  it('Sunday of week containing 2025-04-01 is 2025-03-30', () => {
    expect(getSundayOfWeekContaining('2025-04-01')).toBe('2025-03-30');
  });
});

describe('buildCalendarGridCells', () => {
  it('pads only to full weeks (April 2025 → 5 rows)', () => {
    const cells = buildCalendarGridCells('2025-04');
    expect(cells.length % 7).toBe(0);
    expect(cells).toHaveLength(35);
    const withDate = cells.filter(c => c.dateStr);
    expect(withDate).toHaveLength(30);
    expect(withDate[0].dateStr).toBe('2025-04-01');
    expect(withDate[29].dateStr).toBe('2025-04-30');
    expect(cells[0].day).toBeNull();
    expect(cells[1].day).toBeNull();
    expect(cells[2].day).toBe(1);
  });

  it('March 2026 (Sun 1st) uses 5 rows not 6', () => {
    const cells = buildCalendarGridCells('2026-03');
    expect(cells).toHaveLength(35);
  });
});
