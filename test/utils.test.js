import { describe, it, expect } from 'vitest';
import { randomUniformIndex } from '../js/utils.js';

describe('randomUniformIndex', () => {
  it('returns 0 for invalid or empty range', () => {
    expect(randomUniformIndex(0)).toBe(0);
    expect(randomUniformIndex(-3)).toBe(0);
    expect(randomUniformIndex(NaN)).toBe(0);
    expect(randomUniformIndex(Infinity)).toBe(0);
  });

  it('returns 0 when n is 1', () => {
    expect(randomUniformIndex(1)).toBe(0);
  });

  it('always returns an index in [0, n)', () => {
    for (let t = 0; t < 500; t++) {
      const n = 2 + Math.floor(Math.random() * 80);
      const x = randomUniformIndex(n);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(n);
      expect(Number.isInteger(x)).toBe(true);
    }
  });

  it('distribution is roughly uniform for n=5 (smoke)', () => {
    const n = 5;
    const counts = [0, 0, 0, 0, 0];
    const trials = 15000;
    for (let i = 0; i < trials; i++) {
      counts[randomUniformIndex(n)]++;
    }
    const expected = trials / n;
    for (const c of counts) {
      expect(c / expected).toBeGreaterThan(0.92);
      expect(c / expected).toBeLessThan(1.08);
    }
  });
});
