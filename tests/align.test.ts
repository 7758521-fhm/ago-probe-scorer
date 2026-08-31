import { describe, expect, it } from 'vitest';
import { align, strandSequence } from '../src/core/align';

describe('align', () => {
  const guide = 'GCTAGCTAG'; // revcomp = CTAGCTAGC
  const target = 'AAACTAGCTAGCCCC'; // CTAGCTAGC at index 3

  it('finds a perfect plus-strand hit', () => {
    const a = align(guide, target);
    expect(a).not.toBeNull();
    expect(a!.strand).toBe('plus');
    expect(a!.start).toBe(3);
    expect(a!.mismatches).toEqual([]);
  });

  it('finds a hit on the minus strand when target is pasted reversed', () => {
    const a = align(guide, 'GGGGGCTAGCTAGTTT');
    expect(a).not.toBeNull();
    expect(a!.strand).toBe('minus');
  });

  it('reports mismatches as 0-based guide positions', () => {
    const a = align(guide, 'AAAATAGCTAGCCCC');
    expect(a).not.toBeNull();
    expect(a!.mismatches).toEqual([8]);
  });

  it('resolves ties to the plus strand (original target orientation)', () => {
    const a = align(guide, 'AAAATAGCTAGCCCC');
    expect(a).not.toBeNull();
    expect(a!.strand).toBe('plus');
    expect(a!.mismatches).toEqual([8]);
  });

  it('maps minus-strand mismatches to ascending guide positions', () => {
    const a = align(guide, 'GACTAGCTAA');
    expect(a).not.toBeNull();
    // revcomp(target) = TTAGCTAGTC, guide binds minus strand at start 0
    // with mismatches at guide positions 8 (5' base) and 0 (3' base)
    expect(a!.strand).toBe('minus');
    expect(a!.start).toBe(0);
    expect(a!.mismatches).toEqual([0, 8]);
  });

  it('returns null when mismatch exceeds threshold', () => {
    expect(align(guide, 'AAAAAAAAAAAAAAAA', { maxMismatch: 2 })).toBeNull();
  });

  it('returns null when guide longer than target', () => {
    expect(align(guide, 'GCTAG')).toBeNull();
  });

  it('returns null on empty input', () => {
    expect(align('', 'ACGT')).toBeNull();
  });
});

describe('strandSequence', () => {
  it('returns the target strand the guide binds to', () => {
    const a = align('GCTAGCTAG', 'AAACTAGCTAGCCCC');
    expect(a).not.toBeNull();
    expect(strandSequence(a!)).toBe('AAACTAGCTAGCCCC');
  });
});
