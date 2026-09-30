import React from 'react';
import { Download, FileSpreadsheet, Check, X, FileText } from 'lucide-react';
import { PlanningScenario } from '../../types/demand';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: PlanningScenario;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  scenario,
}) => {
  if (!isOpen) return null;

  const handleDownload = (format: 'csv' | 'json' | 'pdf') => {
    const reportData = `TESSARIS DEMAND & SUPPLY CHAIN OPERATIONS REPORT
Planning Scenario: ${scenario.toUpperCase()}
Generated: ${new Date().toISOString()}

=============================================
SECTION 1: S&OP CONSENSUS SUMMARY
Precision Motion Drives: 10,160 units ($15.24M)
Robotics Control Modules: 6,150 units ($12.30M)

SECTION 2: DRP OUTBOUND REPLENISHMENTS
East Coast DC (Allentown): 1,020 units
Pacific West Coast (Ontario): 875 units
Midwest Regional (Joliet): 760 units

SECTION 3: MPS COMMITTED BUILD LOTS
SD-120P (Precision Servo): 3,200 units (Frozen: 800 | Slushy: 1,200 | Liquid: 1,200)
MC-800X (Motion Controller): 2,250 units (Frozen: 600 | Slushy: 750 | Liquid: 900)

SECTION 4: CRP WORK CENTER UTILIZATION
WC-101 (5-Axis CNC): 99.4% avg (Peak 115.7% - Overtime authorized)
WC-202 (SMT Electronics): 94.9% avg
WC-303 (Laser Brazing): 94.6% avg
WC-404 (Calibration & QA): 93.6% avg

SECTION 5: MRP GENERATED PURCHASE ORDERS
PO-8841 -> NXP Semiconductors (400 EA IC-DSP-M7) - Release Due W40
PO-8892 -> Infineon Technologies (1,000 EA MOD-SIC-1200) - Expedited W44
PO-8903 -> Apex Precision (400 EA ENC-AL-6061) - Released W40
=============================================`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tessaris_demand_ops_report_${scenario}_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[32px] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-black font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Export Supply Chain Dossier</h3>
              <p className="text-xs text-slate-500 font-medium">Scenario: <span className="capitalize font-bold text-black">{scenario}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Export unified operational ledgers across all five stages (S&OP, DRP, MPS, CRP, and MRP) for ERP synchronization or executive reporting.
        </p>

        <div className="space-y-2.5 text-xs">
          <button
            onClick={() => handleDownload('csv')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#dbfced] flex items-center justify-center text-black">
                <FileSpreadsheet className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-black text-slate-900 group-hover:text-black">
                  Full Operations Ledger (Text / CSV)
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Tabular consolidation of all time-phased matrices
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-full">
              .csv
            </span>
          </button>

          <button
            onClick={() => handleDownload('json')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#DDCBF5] flex items-center justify-center text-black">
                <Download className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-black text-slate-900 group-hover:text-black">
                  ERP Integration Payload (JSON)
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Raw structured records for SAP / NetSuite ingestion
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-full">
              .json
            </span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-black rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
