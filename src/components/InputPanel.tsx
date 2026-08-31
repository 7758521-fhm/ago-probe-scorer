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
            onChange={(e) => p.setTempC(e.target.value === '' ? p.tempC : Number(e.target.value))}
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
