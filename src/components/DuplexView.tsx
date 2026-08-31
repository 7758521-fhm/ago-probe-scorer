import type { GuideResult } from '../core/types';
import { alignedRegion3to5 } from '../core/align';

export default function DuplexView({ result }: { result: GuideResult }) {
  const a = result.alignment;
  if (!a) return null;
  const guide = a.guide;
  const region3to5 = alignedRegion3to5(a);
  const mm = new Set(a.mismatches);

  const guideCells = guide.split('').map((b, i) => (
    <span key={i} className={`bp ${mm.has(i) ? 'mm' : ''}`}>{b}</span>
  ));
  const targetCells = region3to5.split('').map((b, i) => (
    <span key={i} className={`bp ${mm.has(i) ? 'mm' : ''}`}>{b}</span>
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
