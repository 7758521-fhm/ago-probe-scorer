# Ago 探针切割评分库

基于文献规则，为 **PfAgo（*Pyrococcus furiosus* Argonaute）** guide·target 切割效率打分的纯前端 Web 工具，辅助实验前筛选探针。

🔗 在线使用：https://7758521-fhm.github.io/ago-probe-scorer/

## 功能

- 输入 target 序列 + 一条或多条 guide 序列，批量评分
- 输出 0-100 总分与等级（推荐 / 可用 / 风险 / 不推荐 / 不可用）
- 每条 guide 展示双链对齐图（含切割位点 ↓ 与错配高亮）与各规则条形分
- 纯前端，无需后端，数据不出浏览器

## 评分规则

| 规则 | 说明 |
|------|------|
| R1 硬性门限 | guide 长度 10-31 nt；5' 磷酸化必需；种子区（2-8 位）错配 ≤1，违反即封顶/归零 |
| R2 错配互补性 | P10/P11 为切割热点，错配权重最高；P10+P11 相邻双错配额外扣分 |
| R3 guide 长度 | 16 nt 最优，偏离最优逐级降分 |
| R4 5' 端碱基 | PfAgo 无偏好，中性 |
| R5 切割位点碱基 | 未发现 PfAgo 偏好，中性 |
| R6 双链稳定性 | GC 40-60% 最优；可选 Tm 子规则（默认关闭） |
| R7 自身结构 | 回文 ≥4 bp、同聚物 ≥5 扣分 |

> 评分基于文献推断的规则，实际切割效率受 buffer、金属离子、温度梯度等影响，请以实验为准。

## 使用

1. 输入 Target 序列（5'→3'，可贴长片段）
2. 输入 Guide 序列（5'→3'，每行一条，支持批量）
3. 设置反应温度（默认 95 °C）、是否 5' 磷酸化
4. 点击「运行评分」

示例（黄金路径）：

- Target：`AAAACGTATCGGAACCTTCCC`
- Guide：`AAGGTTCCGATTACGT`（16 nt）→ 预期总分 96、等级「推荐」

## 本地开发

```bash
npm install
npm run dev      # 开发服务器 → http://localhost:5173
npm test         # 运行测试
npm run build    # 生产构建 → dist/
```

## 技术栈

Vite 6 · React 19 · TypeScript 5.6 · Vitest 3

## 部署

push 到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages（见 `.github/workflows/deploy.yml`）。

## 主要文献

1. Wang et al. Molecular mechanism for target recognition, dimerization, and activation of *Pyrococcus furiosus* Argonaute. *Molecular Cell*, 2024 (PMID 38295801).
2. An engineered PfAgo with wide catalytic temperature range and substrate spectrum. *Adv Sci*, 2025.
3. Argonaute-mediated system for supersensitive and multiplexed detection of rare mutations. bioRxiv 803841.
4. Argonaute protein-based nucleic acid detection technology. *Front. Microbiol.*, 2023.
