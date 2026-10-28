import React from "react";
import { X, Download, FileText, FileSpreadsheet, Printer } from "lucide-react";
import { SimulationResult } from "../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationResult: SimulationResult | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  simulationResult,
}) => {
  if (!isOpen) return null;

  const downloadJson = () => {
    if (!simulationResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulationResult, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `butterfly_experiment_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadCsv = () => {
    if (!simulationResult) return;
    const times = simulationResult.times || [];
    const b = simulationResult.baseline_trajectory || [];
    const p = simulationResult.perturbed_trajectory || [];
    const d = simulationResult.distances || [];

    let csvContent = "data:text/csv;charset=utf-8,time,base_x,base_y,base_z,pert_x,pert_y,pert_z,distance\n";

    for (let i = 0; i < times.length; i++) {
      const bx = b[i] ? b[i][0] : "";
      const by = b[i] ? b[i][1] : "";
      const bz = b[i] ? b[i][2] : "";
      const px = p[i] ? p[i][0] : "";
      const py = p[i] ? p[i][1] : "";
      const pz = p[i] ? p[i][2] : "";
      const dist = d[i] !== undefined ? d[i] : "";
      csvContent += `${times[i]},${bx},${by},${bz},${px},${py},${pz},${dist}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trajectory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(3, 7, 18, 0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: 580,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 40px rgba(0,0,0,0.7)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Download size={18} color="#38bdf8" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Export Scientific Experiment</h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: "4px 8px" }}>
            <X size={16} />
          </button>
        </div>

        {/* Export Options */}
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* JSON Export */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileText size={22} color="#38bdf8" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>JSON Experiment Package</div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                  Complete parameters, configuration hash, and computed metrics.
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={downloadJson} disabled={!simulationResult} style={{ padding: "6px 12px", fontSize: "0.78rem" }}>
              Download JSON
            </button>
          </div>

          {/* CSV Export */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileSpreadsheet size={22} color="#10b981" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>CSV Raw Trajectory Data</div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                  Step-by-step 3D phase-space coordinates and separation distance.
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={downloadCsv} disabled={!simulationResult} style={{ padding: "6px 12px", fontSize: "0.78rem", background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}>
              Download CSV
            </button>
          </div>

          {/* Printable Report */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Printer size={22} color="#fbbf24" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Print Scientific Experiment Report</div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                  Printable summary formatted for classroom/academic submission.
                </div>
              </div>
            </div>
            <button className="btn-secondary" onClick={printReport} style={{ padding: "6px 12px", fontSize: "0.78rem" }}>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
