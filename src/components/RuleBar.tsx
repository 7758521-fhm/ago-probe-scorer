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
