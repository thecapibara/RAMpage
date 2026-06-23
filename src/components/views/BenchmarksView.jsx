import React from 'react';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Segmented from '../ui/Segmented';

export default function BenchmarksView({
  benchType, setBenchType,
  cpuHighScore, isBenchmarking, cpuBenchScore,
  startCpuBenchmark, stopCpuBenchmark,
  gpuHighScores, gpuBenchMode,
  runGpuBenchmark,
}) {
  const gpuBusy = gpuBenchMode !== 'NONE';

  return (
    <Panel title="Benchmarks" status={isBenchmarking || gpuBusy ? 'active' : 'idle'}>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-2">Suite</div>
        <Segmented
          options={[
            { value: 'CPU', label: 'CPU / RAM' },
            { value: 'GPU', label: 'GPU' },
          ]}
          value={benchType}
          onChange={setBenchType}
        />
      </div>

      {benchType === 'CPU' ? (
        <>
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-wide text-[#8B8B92] mb-1">High score</div>
            <div className="text-4xl font-mono font-semibold text-[#34D399]">{cpuHighScore}</div>
            {isBenchmarking && <div className="text-sm text-[#ECECEC] mt-2 font-mono">current: {cpuBenchScore}</div>}
          </div>
          {!isBenchmarking ? (
            <Button variant="primary" icon="Play" onClick={startCpuBenchmark} disabled={gpuBusy}>Run survival</Button>
          ) : (
            <Button variant="destructive" icon="Square" onClick={stopCpuBenchmark}>Stop</Button>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2 mb-8">
            {[
              { key: 'LIGHT', label: 'Light', score: gpuHighScores.LIGHT },
              { key: 'NORMAL', label: 'Normal', score: gpuHighScores.NORMAL },
              { key: 'BURNER', label: 'Burner', score: gpuHighScores.BURNER },
            ].map((row) => (
              <div key={row.key} className="flex justify-between items-center py-2 border-b border-[#232327] last:border-0">
                <span className="text-sm text-[#8B8B92] uppercase tracking-wide">{row.label}</span>
                <span className="text-xl font-mono font-semibold text-[#ECECEC]">{row.score}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={() => runGpuBenchmark('LIGHT')} disabled={isBenchmarking || gpuBusy}>Light</Button>
            <Button variant="primary" onClick={() => runGpuBenchmark('NORMAL')} disabled={isBenchmarking || gpuBusy}>Normal</Button>
            <Button variant="primary" onClick={() => runGpuBenchmark('BURNER')} disabled={isBenchmarking || gpuBusy}>Burner</Button>
          </div>
        </>
      )}
    </Panel>
  );
}
