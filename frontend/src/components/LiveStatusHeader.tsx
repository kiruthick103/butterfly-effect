import React from 'react';
import { DataSourceInfo, DataQualityReport, LocationOption } from '../types';

interface LiveStatusHeaderProps {
  dataSource: DataSourceInfo | null;
  dataQuality: DataQualityReport | null;
  locations: LocationOption[];
  currentLocation: string;
  onSelectLocation: (locId: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  secondsSinceLastUpdate: number;
  nextRefreshInSeconds: number;
  onManualRefresh: () => void;
  isLoading: boolean;
  lastUpdatedFlash: boolean;
}

export const LiveStatusHeader: React.FC<LiveStatusHeaderProps> = ({
  dataSource,
  dataQuality,
  locations,
  currentLocation,
  onSelectLocation,
  isDemoMode,
  onToggleDemoMode,
  secondsSinceLastUpdate,
  nextRefreshInSeconds,
  onManualRefresh,
  isLoading,
  lastUpdatedFlash,
}) => {
  const statusType = !dataSource ? 'offline' : isDemoMode ? 'demo' : dataSource.status === 'LIVE' ? 'live' : 'stale';

  return (
    <header className={`glass-panel ${lastUpdatedFlash ? 'flash-update' : ''}`} style={{ padding: '16px 24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Title & Core Subtitle */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-baseline)' }}>LIVE PREDICTION LAB</span>
            </h1>

            {/* Live Pulse Indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: statusType === 'live' ? 'rgba(16, 185, 129, 0.12)' : statusType === 'demo' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${statusType === 'live' ? 'rgba(16, 185, 129, 0.3)' : statusType === 'demo' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              <span className={`live-pulse-dot ${statusType}`} />
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: statusType === 'live' ? '#10b981' : statusType === 'demo' ? '#f59e0b' : '#ef4444'
              }}>
                {statusType === 'live' ? '● LIVE TELEMETRY' : statusType === 'demo' ? 'DEMO / REPLAY' : '● OFFLINE'}
              </span>
            </div>

            {/* Data Quality Pill */}
            {dataQuality && (
              <span className="provenance-tag computed" title={Array.isArray(dataQuality.checks_passed) ? dataQuality.checks_passed.join(', ') : 'Verified bounds'}>
                DATA QUALITY: {dataQuality.status || 'HEALTHY'}
              </span>
            )}
          </div>

          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Atmospheric Convective Instability & Convection Forecasting — Real-time telemetry grounded on Lorenz 1963 dynamics
          </p>
        </div>

        {/* Telemetry Controls & Timers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Location Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Station:</span>
            <select
              value={currentLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '5px 10px', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.lat > 0 ? `${loc.lat}°N` : `${Math.abs(loc.lat)}°S`})
                </option>
              ))}
            </select>
          </div>

          {/* Telemetry Age & Next Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              Updated: <strong style={{ color: 'var(--text-main)' }}>{secondsSinceLastUpdate}s ago</strong>
            </span>
            <span style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              Next: <strong style={{ color: 'var(--accent-baseline)' }}>{nextRefreshInSeconds}s</strong>
            </span>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            className={`btn-secondary ${isDemoMode ? 'active' : ''}`}
            style={{ fontSize: '0.78rem', padding: '5px 10px' }}
            title="Toggle between Live Open-Meteo telemetry and deterministically replayed historical telemetry"
          >
            {isDemoMode ? 'Demo Mode Active' : 'Switch to Demo'}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isLoading}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            title="Ingest fresh telemetry and rerun model inference"
          >
            <span style={{ display: 'inline-block', transform: isLoading ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s linear' }}>
              ↻
            </span>
            {isLoading ? 'Ingesting...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Provider Details Bar */}
      {dataSource && (
        <div style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.74rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            SOURCE: <span style={{ color: 'var(--text-muted)' }}>{dataSource.provider}</span> ({dataSource.station})
            &nbsp;•&nbsp; LAT/LON: <span style={{ color: 'var(--text-muted)' }}>{dataSource.latitude.toFixed(2)}, {dataSource.longitude.toFixed(2)}</span>
            &nbsp;•&nbsp; LATENCY: <span style={{ color: '#10b981' }}>{dataSource.latency_ms} ms</span>
          </div>
          <div>
            FREQUENCY: <span style={{ color: 'var(--text-muted)' }}>{dataSource.update_frequency}</span>
            &nbsp;•&nbsp; <span style={{ color: isDemoMode ? '#f59e0b' : '#38bdf8' }}>{dataSource.note}</span>
          </div>
        </div>
      )}
    </header>
  );
};
