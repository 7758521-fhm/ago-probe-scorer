# Ago 探针切割评分库 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 构建一个纯前端静态 Web 应用，用户输入 target 与 guide 序列，工具基于文献规则为 PfAgo guide·target 切割效率打分（0-100 + 等级），辅助实验前筛选。

**架构：** React + Vite + TypeScript 单页应用。全部科学逻辑为纯 TS 函数（`src/core/`），蛋白规则集中在一个配置文件（`src/proteins/pfago.ts`）。UI 为输入面板 + 批量结果表 + 单条评分卡片（含双链对齐图与规则条形分）。Vitest 单测覆盖核心逻辑。

**技术栈：** Vite 6 · React 19 · TypeScript 5.6 · Vitest 3。无路由、无 UI 库、无后端。

**项目根目录：** `C:/Users/Administrator/ago-probe-scorer/`（已含 `docs/`，需 `git init`）。非 git 仓库、无历史可隔离，故不使用 worktree。

---

### 任务 1：项目脚手架

**文件：**
- 创建：`package.json`、`vite.config.ts`、`tsconfig.json`、`index.html`、`.gitignore`、`src/vite-env.d.ts`、`src/main.tsx`、`src/App.tsx`、`src/App.css`

- [ ] **步骤 1：创建 package.json**

```json
{
  "name": "ago-probe-scorer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **步骤 2：创建 vite.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
```

- [ ] **步骤 3：创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **步骤 4：创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ago 探针切割评分库</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **步骤 5：创建 .gitignore**

```
node_modules
dist
```

- [ ] **步骤 6：创建 src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **步骤 7：创建 src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **步骤 8：创建 src/App.tsx（占位版本，任务 7 完善）**

```tsx
export default function App() {
  return <div className="app"><h1>Ago 探针切割评分库</h1></div>;
}
```

- [ ] **步骤 9：创建 src/App.css（占位，任务 9 完善）**

```css
.app { max-width: 980px; margin: 0 auto; padding: 24px 16px; }
```

- [ ] **步骤 10：安装依赖**

运行：`npm install`
预期：`node_modules/` 生成，无 error。

- [ ] **步骤 11：验证构建**

运行：`npm run build`
预期：`dist/` 生成，`tsc` 无类型错误。

- [ ] **步骤 12：初始化 git 并提交**

```bash
git init
git add package.json vite.config.ts tsconfig.json index.html .gitignore src
git commit -m "chore: scaffold vite react-ts project"
```

---

### 任务 2：核心类型与序列工具

**文件：**
- 创建：`src/core/types.ts`
- 创建：`src/utils/sequence.ts`
- 测试：`tests/sequence.test.ts`

- [ ] **步骤 1：编写失败的测试**

`tests/sequence.test.ts`：

```ts
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
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npx vitest run tests/sequence.test.ts`
预期：FAIL，模块不存在。

- [ ] **步骤 3：创建 src/core/types.ts**

```ts
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
```

- [ ] **步骤 4：创建 src/utils/sequence.ts**

```ts
const COMP: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };

export function cleanSequence(input: string): string {
  const upper = input.toUpperCase().replace(/[^A-Z]/g, '');
  return upper
    .split('')
    .map((c) => (c === 'U' ? 'T' : c))
    .filter((c) => 'ACGT'.includes(c))
    .join('');
}

export function complement(base: string): string {
  return COMP[base] ?? base;
}

export function reverseComplement(seq: string): string {
  return seq.split('').reverse().map(complement).join('');
}
```

- [ ] **步骤 5：运行测试验证它通过**

运行：`npx vitest run tests/sequence.test.ts`
预期：PASS（3 个 describe）。

- [ ] **步骤 6：提交**

```bash
git add src/core/types.ts src/utils/sequence.ts tests/sequence.test.ts
git commit -m "feat: core types and sequence utils with tests"
```

---

### 任务 3：蛋白配置

**文件：**
- 创建：`src/proteins/pfago.ts`
- 测试：`tests/profile.test.ts`

- [ ] **步骤 1：编写失败的测试**

`tests/profile.test.ts`：

```ts
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
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npx vitest run tests/profile.test.ts`
预期：FAIL，模块不存在。

- [ ] **步骤 3：创建 src/proteins/pfago.ts**

```ts
import type { ProteinProfile } from '../core/types';

export const PfAgoProfile: ProteinProfile = {
  id: 'PfAgo',
  name: 'Pyrococcus furiosus Argonaute',
  defaultTempC: 95,
  minGuideLen: 10,
  maxGuideLen: 31,
  optimalGuideLen: 16,
  requires5p: true,
  seedRegion: [2, 8],
  maxSeedMismatch: 1,
  mismatchPenalty: {
    p1: 5,
    seed: 15,
    p9p11: 25,
    p10: 10,
    double1011Extra: 30,
    central: 10,
    tail: 5,
  },
  lengthCurve: [
    { min: 16, max: 16, score: 100 },
    { min: 15, max: 15, score: 95 },
    { min: 17, max: 17, score: 95 },
    { min: 14, max: 14, score: 85 },
    { min: 18, max: 18, score: 85 },
    { min: 13, max: 13, score: 70 },
    { min: 19, max: 19, score: 70 },
    { min: 12, max: 12, score: 55 },
    { min: 20, max: 20, score: 55 },
    { min: 11, max: 11, score: 40 },
    { min: 21, max: 24, score: 40 },
    { min: 10, max: 10, score: 25 },
    { min: 25, max: 31, score: 25 },
  ],
  fivePrimeBase: null,
  cleavageSiteBase: null,
  gcOptimal: [0.4, 0.6],
  tmEnabled: false,
  weights: { r2: 30, r3: 10, r4: 5, r5: 5, r6: 25, r7: 15 },
};
```

- [ ] **步骤 4：运行测试验证它通过**

运行：`npx vitest run tests/profile.test.ts`
预期：PASS。

- [ ] **步骤 5：提交**

```bash
git add src/proteins/pfago.ts tests/profile.test.ts
git commit -m "feat: PfAgo protein profile"
```

---

### 任务 4：结合位点对齐

**文件：**
- 创建：`src/core/align.ts`
- 测试：`tests/align.test.ts`

- [ ] **步骤 1：编写失败的测试**

`tests/align.test.ts`：

```ts
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
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npx vitest run tests/align.test.ts`
预期：FAIL，模块不存在。

- [ ] **步骤 3：创建 src/core/align.ts**

```ts
import { cleanSequence, reverseComplement } from '../utils/sequence';
import type { Alignment, Strand } from './types';

export interface AlignOptions {
  maxMismatch: number;
}

export function align(guideInput: string, targetInput: string, options: AlignOptions = { maxMismatch: 4 }): Alignment | null {
  const guide = cleanSequence(guideInput);
  const target = cleanSequence(targetInput);
  if (guide.length === 0 || target.length === 0) return null;
  if (guide.length > target.length) return null;

  const revCompGuide = reverseComplement(guide);

  let best: { strand: Strand; start: number; mismatches: number[] } | null = null;

  const scan = (strand: Strand, seq: string) => {
    for (let start = 0; start + guide.length <= seq.length; start++) {
      const mismatches: number[] = [];
      for (let j = 0; j < guide.length; j++) {
        if (seq[start + j] !== revCompGuide[j]) {
          mismatches.push(guide.length - 1 - j);
        }
      }
      if (mismatches.length <= options.maxMismatch) {
        if (!best || mismatches.length < best.mismatches.length) {
          best = { strand, start, mismatches };
        }
      }
    }
  };

  scan('plus', target);
  scan('minus', reverseComplement(target));

  if (!best) return null;
  return { guide, target, strand: best.strand, start: best.start, mismatches: best.mismatches };
}

export function strandSequence(a: Alignment): string {
  return a.strand === 'plus' ? a.target : reverseComplement(a.target);
}
```

- [ ] **步骤 4：运行测试验证它通过**

运行：`npx vitest run tests/align.test.ts`
预期：PASS。

- [ ] **步骤 5：提交**

```bash
git add src/core/align.ts tests/align.test.ts
git commit -m "feat: guide-target alignment with mismatch tolerance"
```

---

### 任务 5：评分规则

**文件：**
- 创建：`src/core/scoring.ts`
- 测试：`tests/scoring.test.ts`

- [ ] **步骤 1：编写失败的测试**

`tests/scoring.test.ts`：

```ts
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
    const a = align(guide, 'AAAGACATCTGTAATCCCC')!;
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
    expect(scoreStructure('AAGGTTGGATCCCCGATT').score).toBe(75);
  });
});
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npx vitest run tests/scoring.test.ts`
预期：FAIL，模块不存在。

- [ ] **步骤 3：创建 src/core/scoring.ts**

```ts
import { reverseComplement } from '../utils/sequence';
import { strandSequence } from './align';
import type { Alignment, ProteinProfile, RuleResult } from './types';

function rule(id: string, name: string, score: number, detail: string[]): RuleResult {
  return { id, name, score, detail };
}

export function scoreComplementarity(guide: string, alignment: Alignment, profile: ProteinProfile): RuleResult {
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

export function scoreCleavageSiteBase(guide: string, alignment: Alignment, profile: ProteinProfile): RuleResult {
  const table = profile.cleavageSiteBase;
  if (!table) {
    return rule('r5', '切割位点碱基', 100, ['未配置碱基偏好，视为中性']);
  }
  const strand = strandSequence(alignment);
  const region5to3 = strand.slice(alignment.start, alignment.start + guide.length);
  const region3to5 = region5to3.split('').reverse().join('');
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
  const seen = new Set<string>();
  for (let start = 0; start < seq.length; start++) {
    for (let len = 4; len <= 8 && start + len <= seq.length; len++) {
      const window = seq.slice(start, start + len);
      if (window === reverseComplement(window)) {
        if (!seen.has(window)) {
          seen.add(window);
          count++;
        }
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
```

- [ ] **步骤 4：运行测试验证它通过**

运行：`npx vitest run tests/scoring.test.ts`
预期：PASS。若某个错配示例的预期位置不对，检查 `align` 的 `mismatches` 为 0-based guide 位置、且测试 target 构造正确（region 索引 r ↔ guide 索引 `len-1-r`）。

- [ ] **步骤 5：提交**

```bash
git add src/core/scoring.ts tests/scoring.test.ts
git commit -m "feat: rule-based sub-scorers R2-R7 with tests"
```

---

### 任务 6：聚合与等级

**文件：**
- 创建：`src/core/aggregate.ts`
- 测试：`tests/aggregate.test.ts`

- [ ] **步骤 1：编写失败的测试**

`tests/aggregate.test.ts`：

```ts
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
  const target = 'AAAACGTATCGGAACCTTCCC'; // revcomp(guide) at index 3

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
  });

  it('length 9 (below min) -> total 0, grade 不可用', () => {
    const r = scoreGuide('AAGGTTCCG', 'AAACGGAACCTTCCC', P, { fivePrimePhosphorylated: true });
    expect(r.total).toBe(0);
    expect(r.grade).toBe('不可用');
  });

  it('two seed mismatches capped at 40', () => {
    const r = scoreGuide(guide, 'AAAACGTATCGGAAAGTTCCC', P, { fivePrimePhosphorylated: true });
    expect(r.capped).toBe(true);
    expect(r.total).toBe(40);
    expect(r.grade).toBe('风险');
  });

  it('no binding site -> total 0, grade 不可用', () => {
    const r = scoreGuide(guide, 'TTTTTTTTTTTTTTTTTTTT', P, { fivePrimePhosphorylated: true });
    expect(r.alignment).toBeNull();
    expect(r.total).toBe(0);
    expect(r.grade).toBe('不可用');
  });
});
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npx vitest run tests/aggregate.test.ts`
预期：FAIL，模块不存在。

- [ ] **步骤 3：创建 src/core/aggregate.ts**

```ts
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
    gateDetails.push(`种子区（2-8 位）错配 ${seedMismatch} 个（允许 ≤${profile.maxSeedMismatch}），分数封顶 40`);
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
```

- [ ] **步骤 4：运行测试验证它通过**

运行：`npx vitest run tests/aggregate.test.ts`
预期：PASS。

- [ ] **步骤 5：运行全部测试**

运行：`npm test`
预期：所有测试 PASS。

- [ ] **步骤 6：提交**

```bash
git add src/core/aggregate.ts tests/aggregate.test.ts
git commit -m "feat: weighted aggregation with R1 gates and grades"
```

---

### 任务 7：UI 输入面板与主组件

**文件：**
- 修改：`src/App.tsx`
- 创建：`src/components/InputPanel.tsx`

- [ ] **步骤 1：创建 src/components/InputPanel.tsx**

```tsx
import type { Dispatch, SetStateAction } from 'react';
import type { ProteinProfile } from '../core/types';

interface Props {
  profile: ProteinProfile;
  target: string;
  setTarget: Dispatch<SetStateAction<string>>;
  guidesInput: string;
  setGuidesInput: Dispatch<SetStateAction<string>>;
  tempC: number;
  setTempC: Dispatch<SetStateAction<number>>;
  phosphorylated: boolean;
  setPhosphorylated: Dispatch<SetStateAction<boolean>>;
  onRun: () => void;
}

export default function InputPanel(p: Props) {
  return (
    <section className="input-panel">
      <div className="field">
        <label>Ago 蛋白</label>
        <div className="protein-row">
          <button className="protein-chip" type="button">{p.profile.name}</button>
          <span className="coming-soon">KmAgo · 其他 pAgo（即将支持）</span>
        </div>
      </div>
      <div className="field">
        <label>Target 序列（5'→3'）</label>
        <textarea
          value={p.target}
          onChange={(e) => p.setTarget(e.target.value)}
          placeholder="粘贴 target DNA 序列，可贴长片段"
          rows={4}
          spellCheck={false}
        />
      </div>
      <div className="field">
        <label>Guide 序列（5'→3'，每行一条，支持批量）</label>
        <textarea
          value={p.guidesInput}
          onChange={(e) => p.setGuidesInput(e.target.value)}
          placeholder={'GCTAGCTAGCTAGCTAG\nACGTACGTACGTACGT'}
          rows={5}
          spellCheck={false}
        />
      </div>
      <div className="params-row">
        <label>
          反应温度（°C）
          <input
            type="number"
            value={p.tempC}
            onChange={(e) => p.setTempC(Number(e.target.value))}
            min={40}
            max={100}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={p.phosphorylated}
            onChange={(e) => p.setPhosphorylated(e.target.checked)}
          />
          5' 磷酸化
        </label>
      </div>
      <button className="run-button" type="button" onClick={p.onRun}>运行评分</button>
    </section>
  );
}
```

- [ ] **步骤 2：改写 src/App.tsx 接入输入与计算**

```tsx
import { useMemo, useState } from 'react';
import { PfAgoProfile } from './proteins/pfago';
import { scoreGuide } from './core/aggregate';
import type { GuideResult, ProteinProfile } from './core/types';
import InputPanel from './components/InputPanel';
import './App.css';

export default function App() {
  const [profile] = useState<ProteinProfile>(PfAgoProfile);
  const [target, setTarget] = useState('');
  const [guidesInput, setGuidesInput] = useState('');
  const [tempC, setTempC] = useState(PfAgoProfile.defaultTempC);
  const [phosphorylated, setPhosphorylated] = useState(true);
  const [results, setResults] = useState<GuideResult[] | null>(null);

  const guides = useMemo(
    () => guidesInput.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 0),
    [guidesInput],
  );

  const run = () => {
    if (target.trim() === '' || guides.length === 0) return;
    setResults(guides.map((g) => scoreGuide(g, target, profile, { fivePrimePhosphorylated: phosphorylated, tempC })));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ago 探针切割评分库</h1>
        <p className="subtitle">PfAgo（Pyrococcus furiosus Argonaute）guide·target 切割效率文献规则打分器</p>
      </header>
      <main>
        <InputPanel
          profile={profile}
          target={target}
          setTarget={setTarget}
          guidesInput={guidesInput}
          setGuidesInput={setGuidesInput}
          tempC={tempC}
          setTempC={setTempC}
          phosphorylated={phosphorylated}
          setPhosphorylated={setPhosphorylated}
          onRun={run}
        />
        {results && <ResultsPanel results={results} />}
      </main>
    </div>
  );
}
```

注：`ResultsPanel` 尚未创建，此步骤暂无法构建 —— 先创建占位再继续：

- [ ] **步骤 3：创建 src/components/ResultsPanel.tsx（占位）**

```tsx
import type { GuideResult } from '../core/types';

export default function ResultsPanel({ results }: { results: GuideResult[] }) {
  return <section className="results-panel"><h2>评分结果</h2><p>共 {results.length} 条 guide。</p></section>;
}
```

- [ ] **步骤 4：验证类型检查与构建**

运行：`npm run build`
预期：构建成功。

- [ ] **步骤 5：启动 dev server 手动冒烟**

运行：`npm run dev`
预期：浏览器打开 http://localhost:5173 显示标题与输入面板，能输入文本，点「运行评分」显示占位结果（任务 8 完善）。手动验证后 `Ctrl+C` 停止。

- [ ] **步骤 6：提交**

```bash
git add src/App.tsx src/components/InputPanel.tsx src/components/ResultsPanel.tsx
git commit -m "feat: input panel and main app wiring"
```

---

### 任务 8：UI 结果展示

**文件：**
- 修改：`src/components/ResultsPanel.tsx`
- 创建：`src/components/GuideResultCard.tsx`、`src/components/DuplexView.tsx`、`src/components/RuleBar.tsx`

- [ ] **步骤 1：改写 src/components/ResultsPanel.tsx**

```tsx
import type { GuideResult } from '../core/types';
import GuideResultCard from './GuideResultCard';

export default function ResultsPanel({ results }: { results: GuideResult[] }) {
  const sorted = [...results].sort((a, b) => b.total - a.total);
  return (
    <section className="results-panel">
      <h2>评分结果（按总分排序）</h2>
      <table className="summary-table">
        <thead>
          <tr><th>#</th><th>Guide</th><th>总分</th><th>等级</th><th>长度</th><th>错配数</th></tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td className="mono">{r.guide}</td>
              <td className="score">{r.total}</td>
              <td><span className={`badge g${r.grade}`}>{r.grade}</span></td>
              <td>{r.alignment ? r.alignment.guide.length : '-'}</td>
              <td>{r.alignment ? r.alignment.mismatches.length : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cards">
        {sorted.map((r, i) => (
          <GuideResultCard key={i} result={r} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **步骤 2：创建 src/components/RuleBar.tsx**

```tsx
import type { RuleResult } from '../core/types';

export default function RuleBar({ rule }: { rule: RuleResult }) {
  return (
    <div className="rule-bar">
      <div className="rule-label">
        <span className="rule-name">{rule.name}</span>
        <span className="rule-score">{rule.score}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${rule.score}%` }} />
      </div>
      <ul className="rule-detail">
        {rule.detail.map((d, i) => <li key={i}>{d}</li>)}
      </ul>
    </div>
  );
}
```

- [ ] **步骤 3：创建 src/components/DuplexView.tsx**

```tsx
import type { GuideResult } from '../core/types';
import { strandSequence } from '../core/align';

export default function DuplexView({ result }: { result: GuideResult }) {
  const a = result.alignment;
  if (!a) return null;
  const guide = a.guide;
  const strand = strandSequence(a);
  const region5to3 = strand.slice(a.start, a.start + guide.length);
  const region3to5 = region5to3.split('').reverse().join('');
  const mm = new Set(a.mismatches);

  const guideCells = guide.split('').map((b, i) => (
    <span key={i} className={`bp ${mm.has(i) ? 'mm' : ''}`}>{b}</span>
  ));
  const targetCells = region3to5.split('').map((b, i) => (
    <span key={i} className={`bp ${mm.has(guide.length - 1 - i) ? 'mm' : ''}`}>{b}</span>
  ));
  const cutPos = Math.min(10, guide.length);
  const blanks = (n: number) =>
    Array.from({ length: n }, (_, i) => <span key={`b${i}`} className="bp" />);

  return (
    <div className="duplex mono">
      <div className="duplex-row guide">5′ {guideCells} 3′</div>
      <div className="duplex-row cut">
        {blanks(cutPos)}
        <span className="cut-mark">↓</span>
        {blanks(guide.length - cutPos)}
      </div>
      <div className="duplex-row target">3′ {targetCells} 5′</div>
    </div>
  );
}
```

注：guide/target 行各有 `5′ `/`3′ ` 三字符前缀；cut 行通过 CSS `padding-left: 3ch`（见任务 9 的 `.duplex-row.cut`）对齐前缀宽度，再放 `cutPos`（=10，或长度不足时=长度）个占位列 + `↓`，使标记落在 P10 与 P11 之间。

- [ ] **步骤 4：创建 src/components/GuideResultCard.tsx**

```tsx
import type { GuideResult } from '../core/types';
import DuplexView from './DuplexView';
import RuleBar from './RuleBar';

export default function GuideResultCard({ result }: { result: GuideResult }) {
  return (
    <article className="guide-card">
      <div className="card-head">
        <span className="mono guide-seq">{result.guide}</span>
        <span className={`badge g${result.grade}`}>{result.grade}</span>
        <span className="total">总分 {result.total}</span>
      </div>
      {!result.alignment ? (
        <p className="warn">未在 target 中找到结合位点（或方向不匹配）。</p>
      ) : (
        <>
          <DuplexView result={result} />
          <div className="rule-bars">
            {result.rules.map((r) => <RuleBar key={r.id} rule={r} />)}
          </div>
        </>
      )}
    </article>
  );
}
```

- [ ] **步骤 5：验证构建**

运行：`npm run build`
预期：构建成功。

- [ ] **步骤 6：dev server 手动验证**

运行：`npm run dev`
预期：
1. 输入 target（如 `AAAACGTATCGGAACCTTCCC`）与 guide（如 `AAGGTTCCGATTACGT`），点「运行评分」。
2. 汇总表显示总分 96、等级「推荐」。
3. 卡片显示双链对齐图（guide 5′→3′ 在上，target 3′→5′ 在下，`↓` 在 P10/P11 之间）与各规则条形分。
4. 批量输入多行 guide 时逐条列出。
手动验证后 `Ctrl+C` 停止。

- [ ] **步骤 7：提交**

```bash
git add src/components/ResultsPanel.tsx src/components/GuideResultCard.tsx src/components/DuplexView.tsx src/components/RuleBar.tsx
git commit -m "feat: results table, duplex view, rule bars"
```

---

### 任务 9：帮助区与完整样式

**文件：**
- 创建：`src/components/HelpSection.tsx`
- 修改：`src/App.tsx`、`src/App.css`

- [ ] **步骤 1：创建 src/components/HelpSection.tsx**

```tsx
export default function HelpSection() {
  return (
    <section className="help">
      <h2>规则说明与引用</h2>
      <p>本工具基于文献规则评估 guide·target 切割效率，输出 0-100 参考分，不替代实验验证。</p>
      <ul>
        <li><b>R1 硬性门限</b>：guide 长度 10-31 nt；5' 磷酸化必需；种子区（2-8 位）错配 ≤1。</li>
        <li><b>R2 错配互补性</b>：P10/P11 为切割热点，错配权重最高。</li>
        <li><b>R3 guide 长度</b>：16 nt 最优（与用户实验室条件及文献一致）。</li>
        <li><b>R4 5' 端碱基</b>：PfAgo 无偏好，中性。</li>
        <li><b>R5 切割位点碱基</b>：未发现 PfAgo 偏好，中性。</li>
        <li><b>R6 双链稳定性</b>：GC 40-60% 最优；Tm 子规则默认关闭。</li>
        <li><b>R7 自身结构</b>：回文 ≥4 bp、同聚物 ≥5 扣分。</li>
      </ul>
      <h3>主要文献</h3>
      <ol>
        <li>Wang et al. Molecular mechanism for target recognition, dimerization, and activation of Pyrococcus furiosus Argonaute. <i>Molecular Cell</i>, 2024 (PMID 38295801).</li>
        <li>An engineered PfAgo with wide catalytic temperature range and substrate spectrum. <i>Adv Sci</i>, 2025.</li>
        <li>Argonaute-mediated system for supersensitive and multiplexed detection of rare mutations. bioRxiv 803841.</li>
        <li>Argonaute protein-based nucleic acid detection technology. <i>Front. Microbiol.</i>, 2023.</li>
      </ol>
      <p className="disclaimer">免责声明：评分基于文献推断的规则，实际切割效率受 buffer、金属离子、温度梯度等影响，请以实验为准。</p>
    </section>
  );
}
```

- [ ] **步骤 2：修改 src/App.tsx 引入 HelpSection**

在 import 区加 `import HelpSection from './components/HelpSection';`，在 `</main>` 之后、`</div>` 之前加 `<HelpSection />`。

- [ ] **步骤 3：改写 src/App.css 为完整样式**

```css
:root {
  --bg: #f6f8fa;
  --panel: #ffffff;
  --border: #d9dee3;
  --text: #1f2328;
  --muted: #57606a;
  --accent: #0969da;
  --ok: #1a7f37;
  --warn: #9a6700;
  --risk: #bc4c00;
  --bad: #cf222e;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
}
.app { max-width: 980px; margin: 0 auto; padding: 24px 16px 64px; }
.app-header h1 { margin: 0 0 4px; font-size: 26px; }
.subtitle { color: var(--muted); margin: 0 0 24px; }
.input-panel, .results-panel, .help {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.field { margin-bottom: 14px; }
.field label { display: block; font-weight: 600; margin-bottom: 6px; }
textarea {
  width: 100%;
  font-family: var(--mono);
  font-size: 13px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
}
textarea:focus { outline: 2px solid var(--accent); }
.protein-row { display: flex; align-items: center; gap: 12px; }
.protein-chip {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  font-weight: 600;
}
.coming-soon { color: var(--muted); font-size: 13px; }
.params-row { display: flex; gap: 24px; align-items: center; margin-bottom: 14px; }
.params-row input[type="number"] { width: 72px; padding: 4px 6px; border: 1px solid var(--border); border-radius: 6px; }
.run-button {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}
.run-button:hover { background: #0a5cc2; }
.summary-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
.summary-table th, .summary-table td { border-bottom: 1px solid var(--border); padding: 6px 8px; text-align: left; }
.summary-table th { color: var(--muted); font-weight: 600; }
.mono { font-family: var(--mono); }
.score { font-weight: 700; }
.badge { padding: 2px 10px; border-radius: 999px; color: #fff; font-size: 12px; font-weight: 600; }
.g推荐 { background: var(--ok); }
.g可用 { background: var(--warn); }
.g风险 { background: var(--risk); }
.g不推荐 { background: var(--bad); }
.g不可用 { background: #6e7781; }
.guide-card { border: 1px solid var(--border); border-radius: 8px; padding: 14px; margin-bottom: 14px; }
.card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.guide-seq { font-size: 15px; font-weight: 600; }
.total { margin-left: auto; font-weight: 700; color: var(--muted); }
.warn { color: var(--bad); font-weight: 600; }
.duplex {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  background: #f0f4f8;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 14px;
}
.duplex-row { display: flex; align-items: center; white-space: nowrap; }
.duplex-row.guide { color: var(--accent); }
.duplex-row.target { color: #6f42c1; }
.duplex-row.cut { padding-left: 3ch; }
.bp { display: inline-block; width: 1.25ch; text-align: center; }
.bp.mm { color: var(--bad); font-weight: 700; text-decoration: underline; }
.cut-mark { color: var(--bad); font-weight: 700; font-size: 16px; }
.rule-bars { margin-top: 12px; }
.rule-bar { margin-bottom: 12px; }
.rule-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 2px; }
.rule-name { font-weight: 600; }
.bar-track { height: 8px; background: #e6eaee; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent); border-radius: 4px; }
.rule-detail { margin: 4px 0 0; padding-left: 18px; font-size: 12px; color: var(--muted); }
.help { font-size: 14px; line-height: 1.7; }
.help h2 { margin-top: 0; }
.disclaimer { color: var(--muted); font-size: 12px; }
```

- [ ] **步骤 4：验证构建与测试**

运行：`npm run build && npm test`
预期：构建成功，全部测试 PASS。

- [ ] **步骤 5：dev server 最终验证**

运行：`npm run dev`
预期：页面完整（头部、输入、结果、帮助区），样式正常；输入示例序列评分与任务 8 一致。验证后 `Ctrl+C`。

- [ ] **步骤 6：提交**

```bash
git add src/components/HelpSection.tsx src/App.tsx src/App.css
git commit -m "feat: help section and full styling"
```

---

### 任务 10：端到端验证与收尾

**文件：**
- 创建：`README.md`（可选，用户若需要）

- [ ] **步骤 1：全量测试**

运行：`npm test`
预期：PASS（sequence/profile/align/scoring/aggregate 全部）。

- [ ] **步骤 2：生产构建**

运行：`npm run build`
预期：`dist/` 生成，无错误无警告。

- [ ] **步骤 3：浏览器最终验收（Golden path）**

运行：`npm run dev`
在浏览器中验证：
1. **黄金路径**：target `AAAACGTATCGGAACCTTCCC` + guide `AAGGTTCCGATTACGT` → 总分 96、「推荐」、双链图 `↓` 位于 P10/P11、各规则条形分正确。
2. **边界**：guide 长度 9（`AAGGTTCCG`）→ 不可用 0 分；未勾选 5' 磷酸化 → 封顶 40；无结合位点的 target → 未找到结合位点。
3. **批量**：多行 guide 逐条出卡，表格按总分降序。
4. **输入容错**：粘贴带空格/小写/U 的序列（如 `aaacgtatcggaacctt ccc` 中的 U 类输入）被清洗为 ACGT。
验证后 `Ctrl+C` 停止。

- [ ] **步骤 4：提交收尾**

```bash
git add -A
git status
git commit -m "chore: final verification pass"
```

---

## 执行交接

计划完成并保存到 `docs/superpowers/plans/2026-08-31-ago-probe-scorer.md`。两种执行选项：

**1. Subagent-Driven（推荐）** —— 我为每个任务调度一个新子代理，任务间审查，快速迭代

**2. 内联执行** —— 使用 executing-plans 在此会话中执行任务，批次执行带检查点

选择哪个？
