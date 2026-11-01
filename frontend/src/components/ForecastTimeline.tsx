import React, { useState } from 'react';
import { TimelinePoint } from '../types';

interface ForecastTimelineProps {
  pastTimeline: TimelinePoint[];
  futureTimeline: TimelinePoint[];
  forecastDirection: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export const ForecastTimeline: React.FC<ForecastTimelineProps> = ({
  pastTimeline,
  futureTimeline,
  forecastDirection
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);

  if (!pastTimeline || pastTimeline.length === 0) {
    return null;
  }

  // Combine points to calculate axis scale
  const allPoints = [...pastTimeline, ...futureTimeline];
  const allValues = allPoints.map((p) => p.value);
  const upperValues = futureTimeline.map((p) => p.upper || p.value);
  const lowerValues = futureTimeline.map((p) => p.lower || p.value);

  const minVal = Math.min(...allValues, ...lowerValues) - 1.0;
  const maxVal = Math.max(...allValues, ...upperValues) + 1.0;
  const valRange = Math.max(0.1, maxVal - minVal);

  const minMin = pastTimeline[0].minute_offset;
  const maxMin = futureTimeline.length > 0 ? futureTimeline[futureTimeline.length - 1].minute_offset : 0;
  const minRange = Math.max(1, maxMin - minMin);

  // SVG dimensions
  const width = 850;
  const height = 260;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;

  const getX = (minute: number) => {
    return padLeft + ((minute - minMin) / minRange) * (width - padLeft - padRight);
  };

  const getY = (val: number) => {
    return height - padBottom - ((val - minVal) / valRange) * (height - padTop - padBottom);
  };

  const nowX = getX(0);

  // Build SVG path for Past (Actual)
  const pastPath = pastTimeline
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.minute_offset).toFixed(1)} ${getY(p.value).toFixed(1)}`)
    .join(' ');

  // Connect last past point to first future point
  const lastPast = pastTimeline[pastTimeline.length - 1];
  const futurePoints = [lastPast, ...futureTimeline];

  // Build SVG path for Future (Forecast)
  const futurePath = futurePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.minute_offset).toFixed(1)} ${getY(p.value).toFixed(1)}`)
    .join(' ');

  // Build Confidence Band Shaded Polygon
  let confidencePolygon = '';
  if (futureTimeline.length > 0) {
    const upperPoints = [
      `${nowX.toFixed(1)} ${getY(lastPast.value).toFixed(1)}`,
      ...futureTimeline.map((p) => `${getX(p.minute_offset).toFixed(1)} ${getY(p.upper || p.value).toFixed(1)}`),
    ];
    const lowerPoints = [
      ...futureTimeline.map((p) => `${getX(p.minute_offset).toFixed(1)} ${getY(p.lower || p.value).toFixed(1)}`).reverse(),
      `${nowX.toFixed(1)} ${getY(lastPast.value).toFixed(1)}`,
    ];
    confidencePolygon = [...upperPoints, ...lowerPoints].join(' ');
  }

  const forecastColor = forecastDirection === 'INCREASING' ? '#10b981' : forecastDirection === 'DECREASING' ? '#fb7185' : '#818cf8';

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>FORECAST TIMELINE</h2>
            <span className="provenance-tag computed">TEMPORAL PROJECTION</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Comparing verified historical telemetry against 30-minute forward ensemble cone of uncertainty
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 14, height: 3, background: '#38bdf8', borderRadius: 2 }} />
            <span style={{ color: 'var(--text-muted)' }}>Actual Observations</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 14, height: 2, borderTop: `2px dashed ${forecastColor}` }} />
            <span style={{ color: forecastColor }}>Forecast Trajectory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 12, height: 10, background: 'rgba(129, 140, 248, 0.2)', border: '1px solid rgba(129, 140, 248, 0.4)', borderRadius: 2 }} />
            <span style={{ color: 'var(--text-dim)' }}>Confidence Corridor</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="corridorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={forecastColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={forecastColor} stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="pastAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = minVal + pct * valRange;
            const y = getY(val);
            return (
              <g key={pct}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3 3" />
                <text x={padLeft - 8} y={y + 3} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Vertical NOW Boundary Divider */}
          <line
            x1={nowX}
            y1={padTop - 10}
            x2={nowX}
            y2={height - padBottom}
            stroke="rgba(56, 189, 248, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Past / Future Background Regions */}
          <rect x={padLeft} y={padTop - 10} width={nowX - padLeft} height={height - padTop - padBottom + 10} fill="rgba(56, 189, 248, 0.02)" />
          <rect x={nowX} y={padTop - 10} width={width - padRight - nowX} height={height - padTop - padBottom + 10} fill="rgba(129, 140, 248, 0.03)" />

          {/* Timeline Section Labels */}
          <text x={nowX - 14} y={padTop} fill="#38bdf8" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="end">
            PAST (ACTUAL)
          </text>
          <text x={nowX + 14} y={padTop} fill={forecastColor} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="start">
            FUTURE (FORECAST)
          </text>

          {/* Shaded Confidence Corridor */}
          {confidencePolygon && (
            <polygon points={confidencePolygon} fill="url(#corridorGradient)" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="0.8" />
          )}

          {/* Past Actual Line */}
          <path d={pastPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Future Forecast Line */}
          <path
            d={futurePath}
            fill="none"
            stroke={forecastColor}
            strokeWidth="2.5"
            strokeDasharray="6 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Past Observation Points */}
          {pastTimeline.map((p, idx) => (
            <circle
              key={`past-${idx}`}
              cx={getX(p.minute_offset)}
              cy={getY(p.value)}
              r="3.5"
              fill="#060913"
              stroke="#38bdf8"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Future Forecast Points */}
          {futureTimeline.map((p, idx) => (
            <circle
              key={`fut-${idx}`}
              cx={getX(p.minute_offset)}
              cy={getY(p.value)}
              r="3"
              fill="#060913"
              stroke={forecastColor}
              strokeWidth="1.5"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* NOW Indicator Pulse Node */}
          <g transform={`translate(${nowX}, ${getY(lastPast.value)})`}>
            <circle r="7" fill="#38bdf8" fillOpacity="0.4">
              <animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          </g>

          {/* Time Axis Labels */}
          {[-30, -20, -10, 0, 10, 20, 30].map((min) => {
            if (min < minMin || min > maxMin) return null;
            const x = getX(min);
            return (
              <g key={min}>
                <line x1={x} y1={height - padBottom} x2={x} y2={height - padBottom + 5} stroke="rgba(148, 163, 184, 0.4)" />
                <text x={x} y={height - padBottom + 17} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                  {min === 0 ? 'NOW' : `${min > 0 ? '+' : ''}${min}m`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 15,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--border-focus)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div>
              <span style={{ color: hoveredPoint.is_projected ? forecastColor : '#38bdf8', fontWeight: 700 }}>
                {hoveredPoint.is_projected ? '● MODEL FORECAST' : '● ACTUAL OBSERVATION'}
              </span>
              &nbsp;({hoveredPoint.minute_offset > 0 ? `+${hoveredPoint.minute_offset}` : hoveredPoint.minute_offset} min)
            </div>
            <div>
              Value: <strong style={{ color: 'var(--text-main)' }}>{hoveredPoint.value.toFixed(2)}</strong> units
            </div>
            {hoveredPoint.upper && hoveredPoint.lower && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                95% Corridor: [{hoveredPoint.lower.toFixed(2)} ... {hoveredPoint.upper.toFixed(2)}]
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
