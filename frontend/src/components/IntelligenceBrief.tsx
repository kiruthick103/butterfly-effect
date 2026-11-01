import React, { useState } from 'react';
import { ForecastEvidenceItem, ModelBreakdownItem } from '../types';

interface IntelligenceBriefProps {
  intelligenceBrief: string;
  provenanceTag: string;
  evidenceItems: ForecastEvidenceItem[];
  modelBreakdown: ModelBreakdownItem[];
}

export const IntelligenceBrief: React.FC<IntelligenceBriefProps> = ({
  intelligenceBrief,
  provenanceTag,
  evidenceItems,
  modelBreakdown,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(evidenceItems[0]?.id || null);

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left Column: Intelligence Brief & Multi-Model Breakdown */}
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>INTELLIGENCE BRIEF</h2>
              <span className="provenance-tag ai">AI SYNTHESIS</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {provenanceTag}
            </span>
          </div>

          {/* AI Explanation Box */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '16px 18px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--accent-baseline)',
            lineHeight: 1.6,
            fontSize: '0.88rem',
            color: 'var(--text-main)',
            marginBottom: '18px'
          }}>
            {intelligenceBrief}
          </div>

          {/* Multi-Model Breakdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Multi-Model Forecasting Engines
              </span>
              <span className="provenance-tag computed">ENSEMBLE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {modelBreakdown.map((m, idx) => {
                const dirColor = m.direction === 'INCREASING' ? '#10b981' : m.direction === 'DECREASING' ? '#fb7185' : '#38bdf8';
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(30, 41, 59, 0.45)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {m.type} • {m.explanation}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: dirColor,
                        padding: '2px 8px',
                        background: `${dirColor}15`,
                        borderRadius: '4px',
                        border: `1px solid ${dirColor}40`
                      }}>
                        {m.direction} ({m.confidence}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Why This Forecast? (Evidence Trail) */}
        <div className="glass-panel" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>WHY THIS FORECAST?</h2>
              <span className="provenance-tag computed">EVIDENCE TRAIL</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {evidenceItems.length} Verified Factors
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {evidenceItems.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    background: isExpanded ? 'rgba(30, 41, 59, 0.7)' : 'rgba(15, 23, 42, 0.5)',
                    border: `1px solid ${isExpanded ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-baseline)',
                        background: 'rgba(56, 189, 248, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        0{idx + 1}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(148, 163, 184, 0.1)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Category: </span>
                        <strong>{item.category}</strong>
                      </div>
                      <div>{item.detail}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
