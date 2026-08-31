# Ago 探针切割评分库（Ago Probe Scorer）— 设计规格

- 日期：2026-08-31
- 状态：已获用户批准（评分模型 / UI 交互 / 技术架构 三节逐一确认）
- 作者：Claude + 用户（PfAgo 领域专家）

## 1. 概述

一个公开的、面向科研用户的 **PfAgo 探针切割效率评分 Web 工具**。用户输入 target 序列与自行设计的 guide 序列（gDNA），工具检查互补性并基于文献规则打分，帮助用户在实验前筛选出可被 PfAgo 有效切割的探针，简化实验流程。

纯前端静态应用（React + Vite + TypeScript）。规则以「蛋白配置文件」形式内置，部署于 GitHub Pages / Vercel 等免费静态托管。后续可平滑扩展更多蛋白（KmAgo 等）。

## 2. 目标用户与核心用例

- 使用 PfAgo 做核酸切割 / 检测的实验室成员（公共库，面向广大用户）
- 核心用例：批量输入候选 guide，快速筛选高概率有效切割的设计，缩小实验验证范围
- 定位：**规则打分器**，不替代实验验证；结果用于排序候选

## 3. 范围

**v1 范围内：**

- 支持 PfAgo 单蛋白；架构以「蛋白配置文件」支持扩展（其他蛋白仅占位显示 coming soon）
- target + guide 双输入，guide 支持批量（每行一条）
- 结合位点自动定位（在 target 中查找，含方向自动识别）
- 7 条规则打分 + 加权聚合 + 等级判定
- 双链对齐可视化 + P10/P11 切割位点标记 + 错配高亮
- 规则说明与文献引用文档区

**v1 范围外（YAGNI）：**

- 后端 / 用户系统 / 用量统计
- ML 模型（后续若接入，架构可扩展）
- URL 分享结果（可后续加）
- 中英双语（v1 仅中文，文案集中管理便于日后扩展）

## 4. 打分模型（PfAgo）

参数来自文献检索 + 用户实验室确认（guide 16 nt / 反应温度 95°C）。

### 4.1 输入定义

- **guide**：5'→3' ssDNA，可选 5'P 标注（`P-ACGT...` 前缀或勾选「5' 磷酸化」）
- **target**：5'→3' 序列，可贴长片段
- **参数**：反应温度 T（默认 95°C）、5' 磷酸化勾选、Tm 子规则开关（默认关）

### 4.2 对齐（align）

- 在 target 5'→3' 序列中查找 guide 的 reverse-complement 结合区（即与 guide 反平行配对的区域），允许错配，阈值默认 ≤4，取最佳命中
- 同时搜索 target 的反向互补链，处理「方向贴反」的情况
- 无命中 → 报告「未找到结合位点」
- 命中后按 guide 5'→3' 编号，target 侧反向配对

### 4.3 R1 硬性门限

| 条件 | 后果 |
|---|---|
| guide 长度 <10 或 >31 nt | 判不可用（score = 0） |
| 未 5' 磷酸化 | 分数封顶 40 + 警示（5'P 锚定 MID 结构域，绝对必需） |
| 种子区（guide 2-8 位）错配 >1 | 分数封顶 40 |

### 4.4 R2 错配惩罚（权重 30）

| guide 位置 | 每错配扣分 |
|---|---|
| P1（5' 端） | −5 |
| P2-8（种子区） | −15 |
| **P9、P11** | **−25**（文献：严重降低切割） |
| P10 | −10（单错配可容忍） |
| **P10+P11 双错配** | 额外 −30（相邻 10-11 错配阻断切割） |
| P12-18 | −10 |
| P19+（3' 尾） | −5 |

子分 = `max(0, 100 − 累计惩罚)`

### 4.5 R3 guide 长度（权重 10）

`16→100 · 15/17→95 · 14/18→85 · 13/19→70 · 12/20→55 · 11/21-24→40 · 10/25-31→25 · <10/>31→0`

### 4.6 R4 5' 端碱基（权重 5）

PfAgo **无 5' 端碱基偏好**（Mol Cell 2024 证实）→ 各碱基等权，默认恒 100。配置表可覆盖（供其他有偏好的蛋白）。

### 4.7 R5 切割位点碱基（权重 5）

无文献支持 PfAgo 切割位点碱基偏好 → 默认中性恒 100。真正的决定因素（P10/P11 配对状态）已并入 R2。配置表可覆盖。

### 4.8 R6 双链稳定性（权重 25）

- **GC 含量**（guide 全长）：40-60% → 100；每偏离 1 个百分点扣 2 分（线性）
- **Tm 子规则**（默认关）：开启时按简化公式计算 guide·target 双链 Tm，与反应温度比较，\|ΔT\| ≤ 5°C 满分，超出按比例扣分
- 说明：PfAgo 蛋白本身稳定短双链，**不**套用 PCR 式 Tm 匹配，故 Tm 子规则默认关闭

### 4.9 R7 自身结构风险（权重 15）

- guide 自我互补 / 发夹（≥4 bp 回文或自二聚）：每处 −25
- 同聚物 ≥5（如 AAAAA）：每处 −20

### 4.10 聚合与等级

- **总分** = 归一化加权平均 `Σ(weight_i × sub_i) / Σ(weight_i)`（权重 R2:30, R3:10, R4:5, R5:5, R6:25, R7:15，和=90，自动归一化），受 R1 门限约束
- **等级**：≥80 推荐（绿）· 60-79 可用（黄）· 40-59 风险（橙）· <40 不推荐（红）
- 每项规则输出子分 + 扣分原因，供用户定位问题

### 4.11 文献依据

| 参数 | 依据 |
|---|---|
| 最短 15 nt 有效、16 nt 最适、至 31 nt | Cloud-Clone datasheet；RPA-PfAgo 检测（Poult Sci 2024）；FpAgo 同源数据 |
| 无 5' 端碱基偏好；5'P 必需 | Mol Cell 2024（PMID 38295801）；mPfAgo（Adv Sci 2025） |
| P10/P11 错配热点 | PfAgo 等位基因区分研究（bioRxiv 803841） |
| 种子区 2-8 错配降低活性 | mPfAgo（Adv Sci 2025） |
| 反应温度 ~95°C | 专利 CN119570979A；87-99°C 活性范围 |
| 切割位点位于 guide P10/P11 之间 | 通用 pAgo 结论；PNA-assisted pAgo 研究 |

## 5. UI 与交互（v1）

单页应用，无路由。

- **头部**：工具名称 + 一句话说明 + 文档/引用链接
- **输入区**：
  - 蛋白选择器（PfAgo 可选；其他蛋白显示 coming soon）
  - Target 序列输入框（可贴长序列；自动定位 + 反向搜索防贴反）
  - Guide 输入框（支持批量：每行一条）
  - 参数：反应温度（默认 95°C）、5' 磷酸化勾选、Tm 子规则开关
  - 「运行」按钮
- **结果区**：
  - 批量汇总表：每条 guide 的总分 + 等级徽章，可排序
  - 单条展开卡片：
    - 总分与等级
    - 各规则条形子分（R2-R7）
    - 双链对齐图：guide 5'→3' 在上、target 3'→5' 在下，P10/P11 之间标记 ↓ 切割位点，错配位置彩色高亮
    - 每条规则的扣分原因
- **底部**：规则说明 + 文献引用 + 免责声明（工具不替代实验验证）

**交互细节**：序列只允许 A/C/G/T/U（U 自动转 T）；非字母自动剔除；输入错误就地提示；纯前端即时计算，无网络请求。

**视觉风格**：浅色科研工具风，单一主色（蓝/青），纯 CSS，无重型 UI 库。

## 6. 技术架构

- **Vite + React + TypeScript**，无路由、无重量级依赖
- **核心计算全部为纯 TS 函数**（align / scoring / aggregate），独立可单测
- **蛋白 = 一个配置文件**：`src/proteins/pfago.ts` 集中所有参数与权重

```
ago-probe-scorer/
  index.html · package.json · vite.config.ts · tsconfig.json
  src/
    core/        types.ts · align.ts · scoring.ts · aggregate.ts · thermo.ts
    proteins/    pfago.ts
    components/  InputPanel · ResultsPanel · GuideResultCard · DuplexView · RuleBar
    utils/       sequence.ts（清洗/校验/revcomp）
    App.tsx · main.tsx · App.css
  tests/         Vitest 单测
```

### 6.1 数据/配置结构（pfago.ts 草案）

```ts
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
  mismatchPenalty: { /* 见 4.4 */ },
  lengthCurve: { /* 见 4.5 */ },
  fivePrimeBase: { A: 1, C: 1, G: 1, T: 1 },   // 等权=无偏好
  cleavageSiteBase: null,                       // null=中性
  gcOptimal: [0.4, 0.6],
  tmEnabled: false,
  weights: { r2: 30, r3: 10, r4: 5, r5: 5, r6: 25, r7: 15 },
  // ...
}
```

## 7. 测试策略（Vitest）

- **align**：结合位点定位（精确/错配/方向反）、阈值边界、无命中
- **scoring**：各规则边界值（长度曲线端点、错配惩罚累加、GC 极端、同聚物/回文）
- **aggregate**：加权计算、R1 门限生效、等级边界（80/60/40）

## 8. 部署

静态托管（GitHub Pages / Vercel），`npm run build` 产物为静态 `dist/`，无服务器逻辑。

## 9. 未来扩展（v2 候选）

- 新增蛋白配置（KmAgo 等）
- URL hash 分享结果
- 中英双语
- 用量统计（需后端，届时再评估）
