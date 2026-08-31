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
