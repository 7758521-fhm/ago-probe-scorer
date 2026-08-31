import { align } from './align';
import {
  scoreComplementarity,
  scoreLength,
  scoreFivePrimeBase,
  scoreCleavageSiteBase,
  scoreStability,
  scoreStructure,
} from './scoring';
import { cleanSequence } from '../utils/sequence';
import type { Grade, GuideResult, ProteinProfile, RuleResult } from './types';

export interface AggregateOptions {
  fivePrimePhosphorylated: boolean;
  tempC?: number;
}

export function gradeForScore(score: number): Grade {
  if (score >= 80) return '推荐';
  if (score >= 60) return '可用';
  if (score >= 40) return '风险';
  return '不推荐';
}

export function scoreGuide(guideInput: string, targetInput: string, profile: ProteinProfile, options: AggregateOptions): GuideResult {
  const a = align(guideInput, targetInput);
  const guide = a ? a.guide : cleanSequence(guideInput);

  if (!a) {
    return { guide, alignment: null, rules: [], total: 0, grade: '不可用', capped: true };
  }

  const rules: RuleResult[] = [
    scoreComplementarity(guide, a, profile),
    scoreLength(guide, profile),
    scoreFivePrimeBase(guide, profile),
    scoreCleavageSiteBase(guide, a, profile),
    scoreStability(guide, profile, options.tempC),
    scoreStructure(guide),
  ];
  const weights = profile.weights;
  const pairs: Array<[RuleResult, number]> = [
    [rules[0], weights.r2],
    [rules[1], weights.r3],
    [rules[2], weights.r4],
    [rules[3], weights.r5],
    [rules[4], weights.r6],
    [rules[5], weights.r7],
  ];
  const weightSum = pairs.reduce((s, [, w]) => s + w, 0);
  let total = Math.round(pairs.reduce((s, [r, w]) => s + r.score * w, 0) / weightSum);

  let capped = false;
  const gateDetails: string[] = [];
  const len = guide.length;
  if (len < profile.minGuideLen || len > profile.maxGuideLen) {
    total = 0;
    capped = true;
    gateDetails.push(`guide 长度 ${len} nt 超出可用范围（${profile.minGuideLen}-${profile.maxGuideLen} nt）`);
  }
  const seedMismatch = a.mismatches.filter((i) => i + 1 >= profile.seedRegion[0] && i + 1 <= profile.seedRegion[1]).length;
  if (seedMismatch > profile.maxSeedMismatch) {
    total = Math.min(total, 40);
    capped = true;
    gateDetails.push(`种子区（${profile.seedRegion[0]}-${profile.seedRegion[1]} 位）错配 ${seedMismatch} 个（允许 ≤${profile.maxSeedMismatch}），分数封顶 40`);
  }
  if (profile.requires5p && !options.fivePrimePhosphorylated) {
    total = Math.min(total, 40);
    capped = true;
    gateDetails.push("guide 未 5' 磷酸化（PfAgo 必需），分数封顶 40");
  }

  if (gateDetails.length > 0) {
    rules.push({ id: 'r1', name: '硬性门限', score: total, detail: gateDetails });
  }

  const grade = total === 0 && capped ? '不可用' : gradeForScore(total);
  return { guide, alignment: a, rules, total, grade, capped };
}
