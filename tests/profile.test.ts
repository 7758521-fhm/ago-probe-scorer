import { describe, expect, it } from 'vitest';
import { PfAgoProfile } from '../src/proteins/pfago';

describe('PfAgoProfile', () => {
  it('uses 16 nt / 95 C defaults', () => {
    expect(PfAgoProfile.optimalGuideLen).toBe(16);
    expect(PfAgoProfile.defaultTempC).toBe(95);
  });
  it('weights sum to 90 (normalized later)', () => {
    const w = PfAgoProfile.weights;
    expect(w.r2 + w.r3 + w.r4 + w.r5 + w.r6 + w.r7).toBe(90);
  });
  it('length curve covers 10-31 and pins 16 as optimal', () => {
    expect(PfAgoProfile.lengthCurve[0]).toEqual({ min: 16, max: 16, score: 100 });
    const minLen = Math.min(...PfAgoProfile.lengthCurve.map((r) => r.min));
    const maxLen = Math.max(...PfAgoProfile.lengthCurve.map((r) => r.max));
    expect(minLen).toBe(PfAgoProfile.minGuideLen);
    expect(maxLen).toBe(PfAgoProfile.maxGuideLen);
  });
});
