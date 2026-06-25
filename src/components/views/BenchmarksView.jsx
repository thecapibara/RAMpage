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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Panel title="Benchmarks" status={isBenchmarking || gpuBusy ? 'active' : 'idle'}>
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <Segmented
              options={[
                { value: 'CPU', label: 'CPU / RAM' },
                { value: 'GPU', label: 'GPU' },
              ]}
              value={benchType}
              onChange={setBenchType}
            />
            <span className="chip mono">survival suite</span>
          </div>

          {benchType === 'CPU' ? (
            <>
              <div className="label mb-2">High score</div>
              <div className="metric on text-5xl leading-none mb-3">{cpuHighScore.toLocaleString()}</div>
              {isBenchmarking && (
                <div className="mono text-sm text-fox mt-2 mb-6">current: {cpuBenchScore.toLocaleString()}</div>
              )}
              {!isBenchmarking ? (
                <Button variant="primary" icon="Play" onClick={startCpuBenchmark} disabled={gpuBusy}>Run survival</Button>
              ) : (
                <Button variant="destructive" icon="Square" onClick={stopCpuBenchmark}>Stop</Button>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1 mb-8">
                {[
                  { key: 'LIGHT', label: 'Light', score: gpuHighScores.LIGHT },
                  { key: 'NORMAL', label: 'Normal', score: gpuHighScores.NORMAL },
                  { key: 'BURNER', label: 'Burner', score: gpuHighScores.BURNER },
                ].map((row) => (
                  <div
                    key={row.key}
                    className="flex justify-between items-center py-2.5 border-b border-line last:border-0"
                  >
                    <span className="label">{row.label}</span>
                    <span className="mono text-xl font-semibold text-fox">{row.score.toLocaleString()}</span>
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
      </div>

      <Panel title="High scores">
        <div className="space-y-1">
          <div className="flex justify-between items-center py-3 border-b border-line">
            <span className="label">CPU / RAM</span>
            <span className="mono text-xl font-bold grad-text">{(cpuHighScore || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-line">
            <span className="label">GPU light</span>
            <span className="mono text-lg font-semibold text-fox">{(gpuHighScores.LIGHT || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-line">
            <span className="label">GPU normal</span>
            <span className="mono text-lg font-semibold text-fox">{(gpuHighScores.NORMAL || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="label">GPU burner</span>
            <span className="mono text-lg font-semibold text-fox">{(gpuHighScores.BURNER || 0).toLocaleString()}</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}