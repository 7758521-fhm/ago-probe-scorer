export type Strand = 'plus' | 'minus';

export interface Alignment {
  guide: string;
  target: string;
  strand: Strand;
  start: number;
  mismatches: number[];
}

export interface RuleResult {
  id: string;
  name: string;
  score: number;
  detail: string[];
}

export type Grade = '推荐' | '可用' | '风险' | '不推荐' | '不可用';

export interface GuideResult {
  guide: string;
  alignment: Alignment | null;
  rules: RuleResult[];
  total: number;
  grade: Grade;
  capped: boolean;
}

export interface MismatchPenalties {
  p1: number;
  seed: number;
  p9p11: number;
  p10: number;
  double1011Extra: number;
  central: number;
  tail: number;
}

export interface LengthRange {
  min: number;
  max: number;
  score: number;
}

export interface Weights {
  r2: number;
  r3: number;
  r4: number;
  r5: number;
  r6: number;
  r7: number;
}

export interface ProteinProfile {
  id: string;
  name: string;
  defaultTempC: number;
  minGuideLen: number;
  maxGuideLen: number;
  optimalGuideLen: number;
  requires5p: boolean;
  seedRegion: [number, number];
  maxSeedMismatch: number;
  mismatchPenalty: MismatchPenalties;
  lengthCurve: LengthRange[];
  fivePrimeBase: Record<'A' | 'C' | 'G' | 'T', number> | null;
  cleavageSiteBase: Record<string, number> | null;
  gcOptimal: [number, number];
  tmEnabled: boolean;
  weights: Weights;
}
