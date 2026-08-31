import { describe, expect, it } from 'vitest';
import { align } from '../src/core/align';
import { PfAgoProfile as P } from '../src/proteins/pfago';
import {
  scoreComplementarity,
  scoreLength,
  scoreFivePrimeBase,
  scoreCleavageSiteBase,
  scoreStability,
  scoreStructure,
  gcContent,
} from '../src/core/scoring';

describe('R2 complementarity', () => {
  it('perfect match = 100', () => {
    const a = align('GCTAGCTAG', 'AAACTAGCTAGCCCC')!;
    expect(scoreComplementarity('GCTAGCTAG', a, P).score).toBe(100);
  });
  it('single P9 mismatch = 75', () => {
    const a = align('GCTAGCTAG', 'AAAATAGCTAGCCCC')!;
    expect(a.mismatches).toEqual([8]);
    expect(scoreComplementarity('GCTAGCTAG', a, P).score).toBe(75);
  });
  it('P10+P11 double mismatch = 35', () => {
    const guide = 'GATTACAGATAC';
    const a = align(guide, 'AAAGCCTCTGTAATCCCC')!;
    expect(a.mismatches).toContain(9);
    expect(a.mismatches).toContain(10);
    expect(scoreComplementarity(guide, a, P).score).toBe(35);
  });
});

describe('R3 length', () => {
  it('16 nt = 100', () => {
    expect(scoreLength('ACGTACGTACGTACGT', P).score).toBe(100);
  });
  it('15 nt = 95', () => {
    expect(scoreLength('ACGTACGTACGTACG', P).score).toBe(95);
  });
  it('9 nt = 0 (below min)', () => {
    expect(scoreLength('ACGTACGTA', P).score).toBe(0);
  });
  it('32 nt = 0 (above max)', () => {
    expect(scoreLength('ACGT'.repeat(8), P).score).toBe(0);
  });
});

describe('R4/R5 neutral', () => {
  it('R4 5p base = 100 (no PfAgo preference)', () => {
    expect(scoreFivePrimeBase('ACGTACGTACGTACGT', P).score).toBe(100);
  });
  it('R5 cleavage base = 100 (no preference configured)', () => {
    const a = align('GATTACAGATAC', 'AAAGACATCTGTAATCCCC')!;
    expect(scoreCleavageSiteBase('GATTACAGATAC', a, P).score).toBe(100);
  });
});

describe('R6 stability', () => {
  it('GC in optimal window = 100', () => {
    expect(scoreStability('ACGTACGTACGTACGT', P).score).toBe(100);
  });
  it('0% GC = 20', () => {
    expect(scoreStability('AAAAAAAAAAAAAAAA', P).score).toBe(20);
  });
  it('gcContent of all-A = 0', () => {
    expect(gcContent('AAAAAAAAAAAAAAAA')).toBe(0);
  });
});

describe('R7 structure', () => {
  it('clean guide = 100', () => {
    expect(scoreStructure('AAGGTTCCGATT').score).toBe(100);
  });
  it('homopolymer run >= 5 = 80', () => {
    expect(scoreStructure('AAAAAAGGTTCCGATT').score).toBe(80);
  });
  it('palindrome >= 4 bp = 75', () => {
    expect(scoreStructure('AAGGTTGATCCCCGATT').score).toBe(75);
  });
  it('two identical palindromes at separate positions = 2 occurrences', () => {
    // GATC 在位置 0 和 8，两处独立回文 → 每处 −25 → 100 − 50 = 50
    expect(scoreStructure('GATCGGATGATC').score).toBe(50);
  });
});
