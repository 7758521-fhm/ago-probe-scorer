import type { GuideResult } from '../core/types';

export default function ResultsPanel({ results }: { results: GuideResult[] }) {
  return <section className="results-panel"><h2>评分结果</h2><p>共 {results.length} 条 guide。</p></section>;
}
