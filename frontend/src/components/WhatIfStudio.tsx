import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { WhatIfResponse, AtmosphericFeatures } from '../types';

interface WhatIfStudioProps {
  currentFeatures: AtmosphericFeatures | null;
}

export const WhatIfStudio: React.FC<WhatIfStudioProps> = ({ currentFeatures }) => {
  const [variable, setVariable] = useState<string>('temperature');
  const [perturbation, setPerturbation] = useState<number>(1.0);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeRippleStage, setActiveRippleStage] = useState<number>(0);

  const runSimulation = async (selectedVar = variable, selectedPert = perturbation) => {
    setIsLoading(true);
    try {
      const data = await api.runWhatIf(selectedVar, selectedPert, 15);
      setResult(data);
      // Trigger sequential ripple effect animation
      setActiveRippleStage(0);
      setTimeout(() => setActiveRippleStage(1), 300);
      setTimeout(() => setActiveRippleStage(2), 650);
      setTimeout(() => setActiveRippleStage(3), 1000);
    } catch (err) {
      console.error('What-If simulation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(variable, perturbation);
  }, []);

  const handleSliderChange = (newVal: number) => {
    setPerturbation(newVal);
  };

  // Render Trajectory SVG Comparison
  const renderComparisonChart = () => {
    if (!result) return null;
    const baseTraj = result.baseline_forecast;
    const pertTraj = result.perturbed_forecast;
    const times = result.time_minutes;

    const allValues = [...baseTraj, ...pertTraj];
    const minVal = Math.min(...allValues) - 0.5;
    const maxVal = Math.max(...allValues) + 0.5;
    const valRange = Math.max(0.1, maxVal - minVal);

    const minTime = times[0];
    const maxTime = times[times.length - 1];
    const timeRange = Math.max(1, maxTime - minTime);

    const width = 640;
    const height = 220;
    const pad = 40;

    const getX = (t: number) => pad + ((t - minTime) / timeRange) * (width - pad * 2);
    const getY = (v: number) => height - pad - ((v - minVal) / valRange) * (height - pad * 2);

    const basePath = baseTraj.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(times[i]).toFixed(1)} ${getY(v).toFixed(1)}`).join(' ');
    const pertPath = pertTraj.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(times[i]).toFixed(1)} ${getY(v).toFixed(1)}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const v = minVal + pct * valRange;
          const y = getY(v);
          return (
            <g key={pct}>
              <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
              <text x={pad - 6} y={y + 3} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Baseline Path (Cyan) */}
        <path d={basePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Perturbed Path (Amber / Crimson) */}
        <path d={pertPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />

        {/* Start Point */}
        <circle cx={getX(times[0])} cy={getY(baseTraj[0])} r="4" fill="#ffffff" />

        {/* End Points */}
        <circle cx={getX(times[times.length - 1])} cy={getY(baseTraj[baseTraj.length - 1])} r="4" fill="#38bdf8" />
        <circle cx={getX(times[times.length - 1])} cy={getY(pertTraj[pertTraj.length - 1])} r="4" fill="#f43f5e" />

        {/* Time Axis */}
        {times.filter((_, idx) => idx % 3 === 0).map((t) => (
          <text key={t} x={getX(t)} y={height - 15} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
            +{t}m
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>WHAT-IF PERTURBATION STUDIO</h2>
              <span className="provenance-tag computed">SENSITIVITY EXPERIMENT</span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inject a tiny micro-perturbation into the current atmospheric state and trace its divergence forward in time
            </p>
          </div>

          <button
            onClick={() => runSimulation(variable, perturbation)}
            disabled={isLoading}
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '6px 16px' }}
          >
            {isLoading ? 'Computing Divergence...' : 'Simulate Perturbation'}
          </button>
        </div>

        {/* Interactive Controls Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}>
          {/* Variable Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              Select State Variable to Perturb:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'temperature', label: 'Temperature' },
                { id: 'pressure', label: 'Pressure' },
                { id: 'wind_speed', label: 'Wind Speed' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setVariable(v.id); runSimulation(v.id, perturbation); }}
                  className={`btn-secondary ${variable === v.id ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: '0.78rem', padding: '6px 8px' }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Micro-Perturbation Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Perturbation Magnitude:
              </label>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: perturbation >= 0 ? '#38bdf8' : '#f43f5e'
              }}>
                {perturbation > 0 ? `+${perturbation.toFixed(1)}%` : `${perturbation.toFixed(1)}%`}
              </span>
            </div>
            <input
              type="range"
              min="-5.0"
              max="5.0"
              step="0.5"
              value={perturbation}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              onMouseUp={() => runSimulation(variable, perturbation)}
              onTouchEnd={() => runSimulation(variable, perturbation)}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              <span>-5.0%</span>
              <span>0.0%</span>
              <span>+5.0%</span>
            </div>
          </div>
        </div>

        {/* SIGNATURE INTERACTION: The Ripple Effect Propagation */}
        {result && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
              DYNAMICAL PROPAGATION: THE RIPPLE EFFECT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {result.ripple_trace.map((step, idx) => {
                const isLighting = activeRippleStage >= idx;
                return (
                  <div
                    key={idx}
                    className={activeRippleStage === idx ? 'ripple-active' : ''}
                    style={{
                      background: isLighting ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.4)',
                      border: `1px solid ${isLighting ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: isLighting ? '#38bdf8' : 'var(--text-dim)' }}>
                        STAGE 0{idx + 1} • {step.stage}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>→</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                      {step.label}: <span style={{ color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>{step.value}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {step.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trajectory Comparison and Signature Butterfly Moment Callout */}
        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
            {/* Divergence Chart */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Baseline vs Perturbed Trajectory (30m)
                </span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#38bdf8' }}>— Baseline</span>
                  <span style={{ color: '#f43f5e' }}>-- Perturbed</span>
                </div>
              </div>
              {renderComparisonChart()}
            </div>

            {/* Signature Visual Moment Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px'
            }}>
              <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f43f5e', fontWeight: 700, marginBottom: '6px' }}>
                SIGNATURE BUTTERFLY EFFECT MOMENT
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                A TINY CHANGE CREATED A DIFFERENT FUTURE
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                {result.interpretation}
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Forecast Shift</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
                    {result.final_forecast_shift > 0 ? `+${result.final_forecast_shift}` : result.final_forecast_shift}
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Relative Divergence</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                    {result.percentage_forecast_shift > 0 ? `+${result.percentage_forecast_shift}%` : `${result.percentage_forecast_shift}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
