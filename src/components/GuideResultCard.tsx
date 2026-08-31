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
