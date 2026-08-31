import { cleanSequence, reverseComplement } from '../utils/sequence';
import type { Alignment, Strand } from './types';

export interface AlignOptions {
  maxMismatch: number;
}

interface Candidate {
  strand: Strand;
  start: number;
  mismatches: number[];
}

export function align(
  guideInput: string,
  targetInput: string,
  options: AlignOptions = { maxMismatch: 4 },
): Alignment | null {
  const guide = cleanSequence(guideInput);
  const target = cleanSequence(targetInput);
  if (guide.length === 0 || target.length === 0) return null;
  if (guide.length > target.length) return null;

  const revCompGuide = reverseComplement(guide);

  const scan = (strand: Strand, seq: string): Candidate | null => {
    let bestScan: Candidate | null = null;
    for (let start = 0; start + guide.length <= seq.length; start++) {
      const mismatches: number[] = [];
      for (let j = 0; j < guide.length; j++) {
        if (seq[start + j] !== revCompGuide[j]) {
          mismatches.push(guide.length - 1 - j);
        }
      }
      // deterministic order: ascending 0-based guide positions
      mismatches.sort((a, b) => a - b);
      if (mismatches.length <= options.maxMismatch) {
        if (!bestScan || mismatches.length < bestScan.mismatches.length) {
          bestScan = { strand, start, mismatches };
        }
      }
    }
    return bestScan;
  };

  const pickBest = (a: Candidate | null, b: Candidate | null): Candidate | null => {
    if (!a) return b;
    if (!b) return a;
    return b.mismatches.length < a.mismatches.length ? b : a;
  };

  // plus strand is scanned first so ties resolve to the original target orientation
  const best = pickBest(scan('plus', target), scan('minus', reverseComplement(target)));

  if (!best) return null;
  return {
    guide,
    target,
    strand: best.strand,
    start: best.start,
    mismatches: best.mismatches,
  };
}

export function strandSequence(a: Alignment): string {
  return a.strand === 'plus' ? a.target : reverseComplement(a.target);
}
