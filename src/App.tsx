import { useMemo, useState } from 'react';
import { PfAgoProfile } from './proteins/pfago';
import { scoreGuide } from './core/aggregate';
import type { GuideResult, ProteinProfile } from './core/types';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import HelpSection from './components/HelpSection';
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
      <HelpSection />
    </div>
  );
}
