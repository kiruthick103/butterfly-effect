import React from 'react';
import { ForecastResult, AtmosphericFeatures } from '../types';

interface ForecastHeroCardProps {
  forecast: ForecastResult | null;
  features: AtmosphericFeatures | null;
}

export const ForecastHeroCard: React.FC<ForecastHeroCardProps> = ({ forecast, features }) => {
  if (!forecast || !features) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Awaiting live telemetry ingestion to generate numerical forecast...</p>
      </div>
    );
  }

  const isIncreasing = forecast.direction === 'INCREASING';
  const isDecreasing = forecast.direction === 'DECREASING';
  const directionColor = isIncreasing ? '#10b981' : isDecreasing ? '#fb7185' : '#38bdf8';
  const directionIcon = isIncreasing ? '↑' : isDecreasing ? '↓' : '→';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px 28px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        background: 'linear-gradient(135deg, rgba(13, 21, 38, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)',
      }}
    >
      {/* Decorative ambient corner glow */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${directionColor}33 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="provenance-tag forecast">MODEL FORECAST</span>
          <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Atmospheric Convective State Horizon: <strong>0 – {forecast.horizon_minutes} min</strong>
          </span>
        </div>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Target: Convective Instability Index (C_I)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center' }}>
        {/* Main Forecast Callout */}
        <div>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Next Expected Outcome
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: directionColor, lineHeight: 1 }}>
              {directionIcon} {forecast.direction}
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.86rem', color: 'var(--text-main)' }}>
            Projected Shift:{' '}
            <strong style={{ color: directionColor, fontFamily: 'var(--font-mono)' }}>
              {typeof forecast.expected_delta === 'number'
                ? (forecast.expected_delta > 0 ? `+${forecast.expected_delta.toFixed(2)}` : forecast.expected_delta.toFixed(2))
                : '+0.00'} units
            </strong>{' '}
            over {forecast.horizon_minutes ?? 30} minutes
          </div>
        </div>

        {/* Confidence Meter */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Calibrated Confidence
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {forecast.confidence_pct ?? 75}%
            </span>
          </div>

          {/* Visual progress bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <div
              style={{
                width: `${forecast.confidence_pct ?? 75}%`,
                height: '100%',
                background: `linear-gradient(90deg, #0284c7 0%, ${directionColor} 100%)`,
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
            Based on recent rate of change ({features.rate_per_min > 0 ? `+${features.rate_per_min}` : features.rate_per_min ?? 0}/min),
            pressure tendency ({features.pressure_tendency_hpa_min ?? 0} hPa/min), and multi-model consensus.
          </div>
        </div>

        {/* Alternative Distributions */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Alternative Scenarios
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#10b981' }}>↑ Increasing</span>
              <strong>{forecast.alternative_probabilities?.increasing ?? 70}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#38bdf8' }}>→ Stable</span>
              <strong>{forecast.alternative_probabilities?.stable ?? 20}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fb7185' }}>↓ Decreasing</span>
              <strong>{forecast.alternative_probabilities?.decreasing ?? 10}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
