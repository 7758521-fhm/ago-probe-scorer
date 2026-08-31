import { describe, expect, it } from 'vitest';
import { align, alignedRegion3to5 } from '../src/core/align';
import { complement } from '../src/utils/sequence';

describe('duplex layout contract', () => {
  it('alignedRegion3to5 column i pairs with guide position i on a perfect plus hit', () => {
    const a = align('GCTAGCTAG', 'AAACTAGCTAGCCCC')!;
    const region = alignedRegion3to5(a);
    expect(region.length).toBe(a.guide.length);
    for (let i = 0; i < a.guide.length; i++) {
      expect(region[i]).toBe(complement(a.guide[i]));
    }
  });

  it('target row column of a mismatch matches the guide position in mismatches (not mirrored)', () => {
    // guide pos 8 (3' 端) 错配
    const a = align('GCTAGCTAG', 'AAAATAGCTAGCCCC')!;
    expect(a.mismatches).toEqual([8]);
    const region = alignedRegion3to5(a);
    // 列 i 与 guide 位置 i 配对：非错配列互补，错配列（列 8）不互补
    for (let i = 0; i < a.guide.length; i++) {
      if (a.mismatches.includes(i)) {
        expect(region[i]).not.toBe(complement(a.guide[i]));
      } else {
        expect(region[i]).toBe(complement(a.guide[i]));
      }
    }
    // 关键：列 8 是错配列（而非镜像列 0）
    expect(region[8]).not.toBe(complement(a.guide[8]));
  });

  it('works on a minus-strand hit (pasted reversed target)', () => {
    const a = align('GCTAGCTAG', 'GGGGGCTAGCTAGTTT')!;
    expect(a).not.toBeNull();
    const region = alignedRegion3to5(a);
    expect(region.length).toBe(a.guide.length);
    for (let i = 0; i < a.guide.length; i++) {
      expect(region[i]).toBe(complement(a.guide[i]));
    }
  });
});
