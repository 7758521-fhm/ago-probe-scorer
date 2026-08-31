import { reverseComplement } from '../utils/sequence';
import { alignedRegion3to5 } from './align';
import type { Alignment, ProteinProfile, RuleResult } from './types';

function rule(id: string, name: string, score: number, detail: string[]): RuleResult {
  return { id, name, score, detail };
}

export function scoreComplementarity(_guide: string, alignment: Alignment, profile: ProteinProfile): RuleResult {
  const penalties = profile.mismatchPenalty;
  const [seedStart, seedEnd] = profile.seedRegion;
  const mismatchSet = new Set(alignment.mismatches.map((i) => i + 1));
  let penalty = 0;
  const detail: string[] = [];

  for (const pos of [...mismatchSet].sort((a, b) => a - b)) {
    let p: number;
    if (pos === 1) p = penalties.p1;
    else if (pos >= seedStart && pos <= seedEnd) p = penalties.seed;
    else if (pos === 9 || pos === 11) p = penalties.p9p11;
    else if (pos === 10) p = penalties.p10;
    else if (pos >= 12 && pos <= 18) p = penalties.central;
    else p = penalties.tail;
    penalty += p;
    detail.push(`位置 ${pos}（guide 5'→3'）错配：−${p}`);
  }
  if (mismatchSet.has(10) && mismatchSet.has(11)) {
    penalty += penalties.double1011Extra;
    detail.push(`P10+P11 相邻双错配（切割热点）：额外 −${penalties.double1011Extra}`);
  }
  if (mismatchSet.size === 0) detail.push('与 target 完全互补');

  return rule('r2', '错配互补性', Math.max(0, 100 - penalty), detail);
}

export function scoreLength(guide: string, profile: ProteinProfile): RuleResult {
  const len = guide.length;
  const found = profile.lengthCurve.find((r) => len >= r.min && len <= r.max);
  if (!found) {
    return rule('r3', 'guide 长度', 0, [`guide 长度 ${len} nt 超出可用范围（${profile.minGuideLen}-${profile.maxGuideLen} nt）`]);
  }
  return rule('r3', 'guide 长度', found.score, [`guide 长度 ${len} nt（最优 ${profile.optimalGuideLen} nt）→ ${found.score} 分`]);
}

export function scoreFivePrimeBase(guide: string, profile: ProteinProfile): RuleResult {
  const table = profile.fivePrimeBase;
  if (!table) {
    return rule('r4', "5' 端碱基", 100, ["该蛋白对 5' 端碱基无偏好（PfAgo 文献证实）"]);
  }
  const first = guide[0] as 'A' | 'C' | 'G' | 'T';
  const w = table[first] ?? 0;
  return rule('r4', "5' 端碱基", w * 100, [`5' 端碱基 ${first} 权重 ${w}`]);
}

export function scoreCleavageSiteBase(_guide: string, alignment: Alignment, profile: ProteinProfile): RuleResult {
  const table = profile.cleavageSiteBase;
  if (!table) {
    return rule('r5', '切割位点碱基', 100, ['未配置碱基偏好，视为中性']);
  }
  const region3to5 = alignedRegion3to5(alignment);
  const b10 = region3to5[9] ?? '';
  const b11 = region3to5[10] ?? '';
  const w = table[b10 + b11] ?? table[b10] ?? 0;
  return rule('r5', '切割位点碱基', w * 100, [`P10/P11 处 target 碱基 ${b10}/${b11} 权重 ${w}`]);
}

export function gcContent(guide: string): number {
  let gc = 0;
  for (const c of guide) if (c === 'G' || c === 'C') gc++;
  return gc / guide.length;
}

export function estimateTm(guide: string): number {
  const gc = gcContent(guide);
  return 64.9 + (41 * (gc * guide.length - 16.4)) / guide.length;
}

function scoreGc(guide: string, profile: ProteinProfile): number {
  const [lo, hi] = profile.gcOptimal;
  const gc = gcContent(guide);
  if (gc >= lo && gc <= hi) return 100;
  const distance = gc < lo ? (lo - gc) * 100 : (gc - hi) * 100;
  return Math.max(0, 100 - distance * 2);
}

function scoreTm(guide: string, tempC: number): number {
  const delta = Math.abs(estimateTm(guide) - tempC);
  if (delta <= 5) return 100;
  return Math.max(0, 100 - (delta - 5) * 5);
}

export function scoreStability(guide: string, profile: ProteinProfile, tempC?: number): RuleResult {
  const gcScore = scoreGc(guide, profile);
  const detail = [`GC 含量 ${(gcContent(guide) * 100).toFixed(1)}%（最优 ${profile.gcOptimal[0] * 100}-${profile.gcOptimal[1] * 100}%）→ ${gcScore} 分`];
  let score = gcScore;
  if (profile.tmEnabled) {
    const t = tempC ?? profile.defaultTempC;
    const tmScore = scoreTm(guide, t);
    detail.push(`Tm≈${estimateTm(guide).toFixed(1)}°C，反应温度 ${t}°C → ${tmScore} 分`);
    score = Math.round(gcScore * 0.5 + tmScore * 0.5);
  }
  return rule('r6', '双链稳定性', score, detail);
}

function countPalindromes(seq: string): number {
  let count = 0;
  for (let start = 0; start < seq.length; start++) {
    for (let len = 4; len <= 8 && start + len <= seq.length; len++) {
      const window = seq.slice(start, start + len);
      if (window === reverseComplement(window)) {
        count++;
        break;
      }
    }
  }
  return count;
}

export function scoreStructure(guide: string): RuleResult {
  let penalty = 0;
  const detail: string[] = [];

  let run = 1;
  for (let i = 1; i <= guide.length; i++) {
    if (guide[i] === guide[i - 1]) run++;
    else {
      if (run >= 5) {
        penalty += 20;
        detail.push(`同聚物 ${guide[i - 1].repeat(run)}（连续 ${run} 个）：−20`);
      }
      run = 1;
    }
  }

  const palCount = countPalindromes(guide);
  if (palCount > 0) {
    penalty += palCount * 25;
    detail.push(`自我互补/回文（≥4 bp）${palCount} 处：每处 −25`);
  }

  if (penalty === 0) detail.push('无同聚物与回文风险');
  return rule('r7', '自身结构风险', Math.max(0, 100 - penalty), detail);
}
