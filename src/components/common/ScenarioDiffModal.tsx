import React from 'react';
import { Layers, X, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { PlanningScenario } from '../../types/demand';

interface ScenarioDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenario: PlanningScenario;
  onApplyScenario: (scen: PlanningScenario) => void;
}

export const ScenarioDiffModal: React.FC<ScenarioDiffModalProps> = ({
  isOpen,
  onClose,
  activeScenario,
  onApplyScenario,
}) => {
  if (!isOpen) return null;

  const scenarios: {
    id: PlanningScenario;
    name: string;
    tag: string;
    description: string;
    demandVolume: string;
    revenueTarget: string;
    plantUtilization: string;
    bottleneckCount: number;
    inventoryDays: string;
    feasibilityScore: string;
    accentBg: string;
    accentPill: string;
    tone: 'good' | 'warning' | 'critical';
  }[] = [
    {
      id: 'baseline',
      name: 'Baseline FY26 Tactical Plan',
      tag: 'Operating Baseline',
      description: 'Standard consensus demand based on multi-variate statistical forecasting and validated sales pipeline.',
      demandVolume: '16,310 units',
      revenueTarget: '$27.54M',
      plantUtilization: '94.2%',
      bottleneckCount: 1,
      inventoryDays: '27.3 days',
      feasibilityScore: '96.4%',
      accentBg: 'bg-[#dbfced]/50',
      accentPill: 'bg-[#7AFFA1]',
      tone: 'good',
    },
    {
      id: 'surge',
      name: 'Demand Surge Scenario (+18%)',
      tag: 'Commercial Upside',
      description: 'Hypothetical commercial surge from automotive robotics expansion and EU green energy incentives.',
      demandVolume: '19,245 units (+18%)',
      revenueTarget: '$32.50M (+$4.96M)',
      plantUtilization: '111.4% (Overload)',
      bottleneckCount: 3,
      inventoryDays: '19.8 days (-7.5d)',
      feasibilityScore: '78.2% (Action Req.)',
      accentBg: 'bg-[#fffde3]/60',
      accentPill: 'bg-[#FFF87C]',
      tone: 'warning',
    },
    {
      id: 'constrained',
      name: 'Supply Chain Constrained',
      tag: 'Risk Mitigation',
      description: 'Global wafer foundry allocation bottleneck (-25% raw material semiconductors) testing plant buffers.',
      demandVolume: '12,230 units (-25%)',
      revenueTarget: '$20.65M (-$6.89M)',
      plantUtilization: '74.8%',
      bottleneckCount: 0,
      inventoryDays: '11.4 days (Depleted)',
      feasibilityScore: '65.1% (Critical)',
      accentBg: 'bg-[#ffefe8]/60',
      accentPill: 'bg-[#FFA27D]',
      tone: 'critical',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[32px] max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-black font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">
                What-If Scenario Simulation & Variance Analysis
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Compare multi-variate operational outcomes across demand spikes, supply constraints, and baseline targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scen) => {
            const isSelected = activeScenario === scen.id;

            return (
              <div
                key={scen.id}
                className={`${scen.accentBg} rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-black ring-2 ring-black/10 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${scen.accentPill} text-black`}>
                      {scen.tag}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-black text-black">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-950 mt-3">
                    {scen.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {scen.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-black/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">6-Mo Demand:</span>
                      <span className="font-mono font-bold text-slate-900">{scen.demandVolume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Revenue Target:</span>
                      <span className="font-mono font-bold text-black">{scen.revenueTarget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Plant Load Avg:</span>
                      <span className="font-mono font-bold text-slate-900">{scen.plantUtilization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Bottlenecks:</span>
                      <span className="font-mono font-bold text-slate-900">{scen.bottleneckCount} cells</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Days of Supply:</span>
                      <span className="font-mono font-bold text-slate-900">{scen.inventoryDays}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-black/5">
                      <span className="text-slate-600 font-bold">Feasibility Index:</span>
                      <span className="font-mono font-black text-black">
                        {scen.feasibilityScore}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5">
                  <button
                    onClick={() => {
                      onApplyScenario(scen.id);
                      onClose();
                    }}
                    className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      isSelected
                        ? 'bg-black/10 text-black cursor-default'
                        : 'bg-black text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>{isSelected ? 'Current Scenario' : 'Apply Scenario'}</span>
                    {!isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#7AFFA1]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
