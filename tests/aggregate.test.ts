import { describe, expect, it } from 'vitest';
import { scoreGuide, gradeForScore } from '../src/core/aggregate';
import { PfAgoProfile as P } from '../src/proteins/pfago';

describe('gradeForScore', () => {
  it('maps boundaries', () => {
    expect(gradeForScore(80)).toBe('推荐');
    expect(gradeForScore(79)).toBe('可用');
    expect(gradeForScore(60)).toBe('可用');
    expect(gradeForScore(59)).toBe('风险');
    expect(gradeForScore(40)).toBe('风险');
    expect(gradeForScore(39)).toBe('不推荐');
  });
});

describe('scoreGuide', () => {
  const guide = 'AAGGTTCCGATTACGT'; // 16 nt, 7 GC (43.75%), one ACGT palindrome at 3' end
  // revcomp(guide) = ACGTAATCGGAACCTT, present in the target below at index 3
  const target = 'AAAACGTAATCGGAACCTTCCC';

  it('perfect match: total 96, grade 推荐', () => {
    const r = scoreGuide(guide, target, P, { fivePrimePhosphorylated: true });
    expect(r.alignment).not.toBeNull();
    expect(r.total).toBe(96);
    expect(r.grade).toBe('推荐');
    expect(r.capped).toBe(false);
  });

  it('un-phosphorylated guide capped at 40', () => {
    const r = scoreGuide(guide, target, P, { fivePrimePhosphorylated: false });
    expect(r.total).toBe(40);
    expect(r.capped).toBe(true);
    expect(r.grade).toBe('风险');
    expect(r.rules[r.rules.length - 1].id).toBe('r1');
  });

  it('length 9 (below min) -> total 0, grade 不可用', () => {
    const r = scoreGuide('AAGGTTCCG', 'AAACGGAACCTTCCC', P, { fivePrimePhosphorylated: true });
    expect(r.total).toBe(0);
    expect(r.grade).toBe('不可用');
    expect(r.rules[r.rules.length - 1].id).toBe('r1');
  });

  it('two seed mismatches capped at 40', () => {
    // revcomp(guide) with guide positions 6/7 (1-based, within seed 2-8) mutated
    const r = scoreGuide(guide, 'AAAACGTAATCGACACCTTCCC', P, { fivePrimePhosphorylated: true });
    expect(r.capped).toBe(true);
    expect(r.total).toBe(40);
    expect(r.grade).toBe('风险');
    expect(r.rules[r.rules.length - 1].id).toBe('r1');
  });

  it('length 32 (above max) -> total 0, grade 不可用', () => {
    const longGuide = 'ACGT'.repeat(8); // 32 nt，revcomp 为自身
    const r = scoreGuide(longGuide, 'CCCC' + longGuide + 'GGG', P, { fivePrimePhosphorylated: true });
    expect(r.total).toBe(0);
    expect(r.grade).toBe('不可用');
    expect(r.capped).toBe(true);
    expect(r.rules[r.rules.length - 1].id).toBe('r1');
  });

  it('no binding site -> total 0, grade 不可用', () => {
    const r = scoreGuide(guide, 'TTTTTTTTTTTTTTTTTTTT', P, { fivePrimePhosphorylated: true });
    expect(r.alignment).toBeNull();
    expect(r.total).toBe(0);
    expect(r.grade).toBe('不可用');
  });

  it('tmEnabled passes through to R6', () => {
    const r = scoreGuide(guide, target, P, { fivePrimePhosphorylated: true, tmEnabled: true, tempC: 95 });
    const r6 = r.rules.find((x) => x.id === 'r6');
    expect(r6).toBeDefined();
    expect(r6!.score).toBe(50); // GC 43.75% → GC 分 100；Tm≈40.8 vs 95°C → Tm 分 0；0.5*100+0.5*0=50
  });
});
