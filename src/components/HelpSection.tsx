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
