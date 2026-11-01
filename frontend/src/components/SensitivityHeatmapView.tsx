import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SensitivityMatrixResponse, SensitivityMatrixCell } from '../types';

export const SensitivityHeatmapView: React.FC = () => {
  const [data, setData] = useState<SensitivityMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<SensitivityMatrixCell | null>(null);

  useEffect(() => {
    const fetchMatrix = async () => {
      setIsLoading(true);
      try {
        const res = await api.getSensitivityMatrix();
        setData(res);
      } catch (err) {
        console.error('Failed to load sensitivity matrix:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  const getCellColor = (level: string) => {
    switch (level) {
      case 'EXTREME':
        return { bg: 'rgba(244, 63, 94, 0.45)', border: 'rgba(244, 63, 94, 0.8)', text: '#fecdd3' };
      case 'HIGH':
        return { bg: 'rgba(245, 158, 11, 0.35)', border: 'rgba(245, 158, 11, 0.7)', text: '#fde68a' };
      case 'MEDIUM':
        return { bg: 'rgba(56, 189, 248, 0.25)', border: 'rgba(56, 189, 248, 0.6)', text: '#bae6fd' };
      case 'LOW':
      default:
        return { bg: 'rgba(30, 41, 59, 0.4)', border: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' };
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>INPUT SENSITIVITY HEATMAP</h2>
              <span className="provenance-tag computed">PERTURBATION MATRIX</span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Quantitative evaluation answering: Which small change in the current state has the largest butterfly impact?
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-dim)' }}>Sensitivity:</span>
            {['LOW', 'MEDIUM', 'HIGH', 'EXTREME'].map((lvl) => {
              const c = getCellColor(lvl);
              return (
                <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 12, height: 12, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 2 }} />
                  <span style={{ color: c.text }}>{lvl}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Evaluating multi-dimensional state perturbations...
          </div>
        ) : !data ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Unable to retrieve sensitivity matrix.
          </div>
        ) : (
          <div>
            {/* Heatmap Matrix Table */}
            <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      State Input
                    </th>
                    {data.perturbation_percentages.map((pct) => (
                      <th
                        key={pct}
                        style={{
                          textAlign: 'center',
                          padding: '8px',
                          color: pct > 0 ? '#38bdf8' : '#fb7185',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700
                        }}
                      >
                        {pct > 0 ? `+${pct}%` : `${pct}%`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.variables.map((varName) => {
                    const rowData = data.sensitivity_matrix[varName] || {};
                    const label = data.variable_labels[varName] || varName;

                    return (
                      <tr key={varName}>
                        <td style={{
                          padding: '12px 14px',
                          background: 'rgba(15, 23, 42, 0.6)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {label}
                        </td>
                        {data.perturbation_percentages.map((pct) => {
                          const cell = rowData[String(pct)];
                          if (!cell) {
                            return <td key={pct} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>-</td>;
                          }
                          const style = getCellColor(cell.sensitivity_level);
                          const isHovered = hoveredCell === cell;

                          return (
                            <td
                              key={pct}
                              onMouseEnter={() => setHoveredCell(cell)}
                              onMouseLeave={() => setHoveredCell(null)}
                              style={{
                                textAlign: 'center',
                                padding: '12px 8px',
                                background: style.bg,
                                border: `1px solid ${isHovered ? '#ffffff' : style.border}`,
                                borderRadius: 'var(--radius-sm)',
                                color: style.text,
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                transform: isHovered ? 'scale(1.05)' : 'none',
                                boxShadow: isHovered ? '0 0 12px rgba(255,255,255,0.2)' : 'none'
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                                {cell.forecast_shift > 0 ? `+${cell.forecast_shift}` : cell.forecast_shift}
                              </div>
                              <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                                {cell.pct_shift > 0 ? `+${cell.pct_shift}%` : `${cell.pct_shift}%`}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Hover Tooltip Details & Explanation */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  Most Sensitive Variable
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-baseline)' }}>
                  {data.variable_labels[data.most_sensitive_variable] || data.most_sensitive_variable}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {data.explanation}
                </div>
              </div>

              {hoveredCell ? (
                <div style={{ borderLeft: '2px solid var(--accent-baseline)', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Inspected Cell Details:
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                    {data.variable_labels[hoveredCell.variable] || hoveredCell.variable}: {hoveredCell.perturbation > 0 ? `+${hoveredCell.perturbation}%` : `${hoveredCell.perturbation}%`}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    Forecast Change: <strong style={{ color: '#f43f5e' }}>{hoveredCell.forecast_shift > 0 ? `+${hoveredCell.forecast_shift}` : hoveredCell.forecast_shift}</strong> ({hoveredCell.pct_shift}%)
                    &nbsp;•&nbsp; Level: <strong style={{ color: '#fbbf24' }}>{hoveredCell.sensitivity_level}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  Hover over any matrix cell to inspect specific forecast divergence magnitude.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
