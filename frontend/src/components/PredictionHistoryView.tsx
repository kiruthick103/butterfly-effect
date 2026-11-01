import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ForecastHistoryResponse } from '../types';

export const PredictionHistoryView: React.FC = () => {
  const [data, setData] = useState<ForecastHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.getForecastHistory();
        setData(res);
      } catch (err) {
        console.error('Failed to load forecast history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>FORECAST EVALUATION & PERFORMANCE</h2>
              <span className="provenance-tag computed">ACTUAL VS PREDICTED</span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Empirical verification tracking whether forward model predictions matched physical reality once the horizon elapsed
            </p>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            EVALUATED AT T + 30 MIN
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading historical forecast performance metrics...
          </div>
        ) : !data ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No prediction records found.
          </div>
        ) : (
          <div>
            {/* Top Scorecard Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Predictions Made</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', marginTop: '2px' }}>
                  {data.predictions_made}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Evaluated Outcomes</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-baseline)', marginTop: '2px' }}>
                  {data.predictions_evaluated}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Directional Accuracy</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981', marginTop: '2px' }}>
                  {data.directional_accuracy_pct.toFixed(1)}%
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Mean Absolute Error (MAE)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24', marginTop: '2px' }}>
                  {data.mae.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Root Mean Square (RMSE)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24', marginTop: '2px' }}>
                  {data.rmse.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Historical Prediction Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <th style={{ padding: '10px 8px' }}>Timestamp</th>
                    <th style={{ padding: '10px 8px' }}>Predicted Target</th>
                    <th style={{ padding: '10px 8px' }}>Actual Outcome</th>
                    <th style={{ padding: '10px 8px' }}>Error (Residual)</th>
                    <th style={{ padding: '10px 8px' }}>Direction</th>
                    <th style={{ padding: '10px 8px' }}>Confidence</th>
                    <th style={{ padding: '10px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((item) => {
                    const isDirectionMatch = item.direction_predicted === item.direction_actual;
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <td style={{ padding: '10px 8px', color: 'var(--text-dim)' }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.predicted_value.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 8px', color: item.actual_outcome !== null ? '#38bdf8' : 'var(--text-dim)' }}>
                          {item.actual_outcome !== null ? item.actual_outcome.toFixed(2) : 'Awaiting Horizon'}
                        </td>
                        <td style={{ padding: '10px 8px', color: item.error !== null && Math.abs(item.error) < 1.0 ? '#10b981' : '#fbbf24' }}>
                          {item.error !== null ? (item.error > 0 ? `+${item.error.toFixed(2)}` : item.error.toFixed(2)) : '—'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            background: isDirectionMatch ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isDirectionMatch ? '#10b981' : '#fb7185',
                            border: `1px solid ${isDirectionMatch ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {item.direction_predicted} {item.direction_actual ? `(Act: ${item.direction_actual})` : ''}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-main)' }}>
                          {item.confidence}%
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className={`provenance-tag ${item.evaluated ? 'computed' : 'observed'}`}>
                            {item.evaluated ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
