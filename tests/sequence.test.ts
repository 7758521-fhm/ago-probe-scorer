import { describe, expect, it } from 'vitest';
import { cleanSequence, reverseComplement, complement } from '../src/utils/sequence';

describe('cleanSequence', () => {
  it('uppercases and strips non-letters', () => {
    expect(cleanSequence('acgt- ACGT_123')).toBe('ACGTACGT');
  });
  it('converts U to T', () => {
    expect(cleanSequence('uaaUG')).toBe('TAATG');
  });
  it('returns empty for non-nucleic input', () => {
    expect(cleanSequence('12345')).toBe('');
  });
});

describe('reverseComplement', () => {
  it('reverse-complements', () => {
    expect(reverseComplement('ACGT')).toBe('ACGT');
    expect(reverseComplement('AAACCC')).toBe('GGGTTT');
  });
});

describe('complement', () => {
  it('complements bases', () => {
    expect(complement('A')).toBe('T');
    expect(complement('G')).toBe('C');
    expect(complement('X')).toBe('X');
  });
});
