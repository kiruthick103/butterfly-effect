import React from 'react';
import { CurrentTelemetry, AtmosphericFeatures } from '../types';

interface LiveMetricsRowProps {
  telemetry: CurrentTelemetry | null;
  features: AtmosphericFeatures | null;
}

export const LiveMetricsRow: React.FC<LiveMetricsRowProps> = ({ telemetry, features }) => {
  if (!telemetry || !features) return null;

  const convectiveValue = features.current_value;
  const convectiveDelta = features.delta;
  const convectiveRate = features.rate_per_min;

  const isRatePositive = convectiveRate > 0;
  const rateColor = isRatePositive ? '#10b981' : convectiveRate < 0 ? '#fb7185' : '#94a3b8';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.0rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            CURRENT STATE TELEMETRY
          </h2>
          <span className="provenance-tag observed">LIVE MEASUREMENTS</span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Sample Time: {new Date(telemetry.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        {/* Metric 1: Convective Instability Index (Target) */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Target Convective Index (C_I)
            </span>
            <span className="provenance-tag computed">COMPUTED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {typeof convectiveValue === 'number' ? convectiveValue.toFixed(2) : '14.20'}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: (convectiveDelta ?? 0) >= 0 ? '#10b981' : '#fb7185' }}>
              {typeof convectiveDelta === 'number' ? (convectiveDelta >= 0 ? `+${convectiveDelta.toFixed(2)}` : convectiveDelta.toFixed(2)) : '+0.00'}
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Rate: <strong style={{ color: rateColor }}>{isRatePositive ? `+${convectiveRate}` : (convectiveRate ?? 0)} /min</strong>
          </div>
        </div>

        {/* Metric 2: Surface Barometric Pressure */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '3px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Surface Pressure
            </span>
            <span className="provenance-tag observed">SENSOR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {typeof telemetry.surface_pressure_hpa === 'number' ? telemetry.surface_pressure_hpa.toFixed(1) : '1013.2'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>hPa</span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Tendency: <strong style={{ color: (features.pressure_tendency_hpa_min ?? 0) < 0 ? '#fb7185' : '#10b981' }}>
              {(features.pressure_tendency_hpa_min ?? 0) > 0 ? `+${features.pressure_tendency_hpa_min}` : (features.pressure_tendency_hpa_min ?? 0)} hPa/min
            </strong>
          </div>
        </div>

        {/* Metric 3: Ambient Temperature */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Ambient Temperature
            </span>
            <span className="provenance-tag observed">SENSOR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {typeof telemetry.temperature_celsius === 'number' ? telemetry.temperature_celsius.toFixed(1) : '18.0'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>°C</span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Humidity: <strong style={{ color: 'var(--text-main)' }}>{typeof telemetry.relative_humidity_pct === 'number' ? telemetry.relative_humidity_pct.toFixed(0) : '60'}%</strong>
          </div>
        </div>

        {/* Metric 4: Surface Wind Speed */}
        <div className="glass-panel" style={{ padding: '16px', borderLeft: '3px solid #818cf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Wind Speed & Shear
            </span>
            <span className="provenance-tag observed">SENSOR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {typeof telemetry.wind_speed_kmh === 'number' ? telemetry.wind_speed_kmh.toFixed(1) : '12.0'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>km/h</span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Volatility: <strong style={{ color: 'var(--text-main)' }}>{typeof features.volatility_1h === 'number' ? features.volatility_1h.toFixed(2) : '0.50'}</strong> (1h window)
          </div>
        </div>
      </div>
    </div>
  );
};
