import React, { useState } from 'react';
import {
  ProcessStep,
  PlanningScenario,
  SOPFamilyPlan,
  DRPReplenishmentRow,
  MPSSkuRow,
  WorkCenterCRP,
  MRPRecord,
  MRPActionMessage,
} from '../../types/demand';
import {
  ArrowRight,
  BarChart3,
  Truck,
  CalendarRange,
  Cpu,
  Boxes,
  Workflow,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProcessMapModuleProps {
  onSelectStep: (step: ProcessStep) => void;
  sopStatus: string;
  drpStatus: string;
  mpsStatus: string;
  crpStatus: string;
  mrpActionCount: number;
  sopPlans: Record<string, SOPFamilyPlan>;
  drpRows: DRPReplenishmentRow[];
  mpsSkus: MPSSkuRow[];
  workCenters: WorkCenterCRP[];
  mrpRecords: MRPRecord[];
  actionMessages: MRPActionMessage[];
  scenario: PlanningScenario;
  onOpenScenarioModal?: () => void;
  onRunRegeneration?: () => void;
}

export const ProcessMapModule: React.FC<ProcessMapModuleProps> = ({
  onSelectStep,
  sopStatus,
  mpsStatus,
  crpStatus,
  mrpActionCount,
  sopPlans,
  drpRows,
  mpsSkus,
  workCenters,
  mrpRecords,
  actionMessages,
  scenario,
  onOpenScenarioModal,
  onRunRegeneration,
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'architecture'>('dashboard');

  // Dynamic calculations across all operational entities
  const totalRevenueUSD = Object.values(sopPlans).reduce((acc, plan) => {
    return acc + plan.periods.reduce((sum, p) => sum + (p.projectedRevenue || 0), 0);
  }, 0) * 1000;

  const totalConsensusUnits = Object.values(sopPlans).reduce((acc, plan) => {
    return acc + plan.periods.reduce((sum, p) => sum + (p.consensusDemand || 0), 0);
  }, 0);

  const totalDemonstratedCapacity = Object.values(sopPlans).reduce((acc, plan) => {
    return acc + plan.periods.reduce((sum, p) => sum + (p.operationsCapacity || 0), 0);
  }, 0);

  const plansArr = Object.values(sopPlans);
  const avgMargin = plansArr.length > 0
    ? (plansArr.reduce((sum, p) => sum + p.consensusMarginPct, 0) / plansArr.length).toFixed(1)
    : '26.4';

  const totalPlannedDRPReleases = drpRows.reduce((sum, row) => {
    return sum + row.periods.reduce((s, p) => s + (p.plannedOrderRelease || 0), 0);
  }, 0);

  const totalFirmCustomerOrders = mpsSkus.reduce((sum, sku) => {
    return sum + sku.periods.reduce((s, p) => s + (p.customerOrders || 0), 0);
  }, 0);

  const totalMPSBuildPlanned = mpsSkus.reduce((sum, sku) => {
    return sum + sku.periods.reduce((s, p) => s + (p.mpsPlannedBuild || 0), 0);
  }, 0);

  const cumulativeATPFinal = mpsSkus.reduce((sum, sku) => {
    const lastPeriod = sku.periods[sku.periods.length - 1];
    return sum + (lastPeriod ? lastPeriod.cumulativeATP : 0);
  }, 0);

  const allLoads = workCenters.flatMap((wc) => wc.loadByWeek);
  const maxWorkCenterUtil = allLoads.length > 0
    ? Math.round(Math.max(...allLoads.map((l) => l.utilizationPct)) * 10) / 10
    : 92.4;
  const totalShopHours = Math.round(allLoads.reduce((sum, l) => sum + l.mpsPlannedLoadHours, 0));
  const bottleneckWorkCenter = workCenters.find((wc) =>
    wc.loadByWeek.some((l) => l.utilizationPct > 100)
  );

  const pendingActionsList = actionMessages.filter((a) => !a.executed);
  const totalCommittedSpend = mrpRecords.reduce((sum, rec) => {
    const totalQty = rec.periods.reduce((s, p) => s + (p.plannedOrderReleases || 0), 0);
    return sum + totalQty * rec.component.standardCostUSD;
  }, 0);
  const avgSupplierReliability = mrpRecords.length > 0
    ? Math.round(mrpRecords.reduce((sum, r) => sum + r.component.supplierReliabilityPct, 0) / mrpRecords.length)
    : 98;

  const steps: {
    id: ProcessStep;
    stepNumber: string;
    acronym: string;
    title: string;
    horizon: string;
    granularity: string;
    keyStat: string;
    keyStatLabel: string;
    statusBadge: string;
    accentBg: string;
    accentPill: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'sop',
      stepNumber: '01',
      acronym: 'S&OP',
      title: 'Sales & Operations',
      horizon: '6 - 24 Months',
      granularity: 'Product Families',
      keyStat: `${totalConsensusUnits.toLocaleString()} units`,
      keyStatLabel: 'Consensus Volume',
      statusBadge: sopStatus === 'Approved' ? 'Approved' : 'Draft',
      accentBg: 'bg-[#dbfced]/80',
      accentPill: 'bg-[#7AFFA1]',
      icon: BarChart3,
    },
    {
      id: 'drp',
      stepNumber: '02',
      acronym: 'DRP',
      title: 'Distribution Network',
      horizon: '1 - 16 Weeks',
      granularity: 'SKU × 3 Depots',
      keyStat: `${totalPlannedDRPReleases.toLocaleString()} units`,
      keyStatLabel: 'Depot Demand Pull',
      statusBadge: 'Balanced',
      accentBg: 'bg-[#fffde3]/90',
      accentPill: 'bg-[#FFF87C]',
      icon: Truck,
    },
    {
      id: 'mps',
      stepNumber: '03',
      acronym: 'MPS',
      title: 'Master Schedule',
      horizon: '1 - 12 Weeks',
      granularity: 'Finished SKUs',
      keyStat: `${totalMPSBuildPlanned.toLocaleString()} units`,
      keyStatLabel: 'Planned Build (ATP)',
      statusBadge: mpsStatus.includes('Locked') ? 'Locked' : 'Active',
      accentBg: 'bg-[#dbfced]/80',
      accentPill: 'bg-[#7AFFA1]',
      icon: CalendarRange,
    },
    {
      id: 'crp',
      stepNumber: '04',
      acronym: 'CRP',
      title: 'Capacity & Labor',
      horizon: '1 - 8 Weeks',
      granularity: 'Machine Cells',
      keyStat: `${maxWorkCenterUtil}% Peak`,
      keyStatLabel: 'Work Center Load',
      statusBadge: crpStatus.includes('Bottleneck') ? 'Alert' : 'Feasible',
      accentPill: crpStatus.includes('Bottleneck') ? 'bg-[#FFA27D]' : 'bg-[#7AFFA1]',
      accentBg: 'bg-[#ffefe8]/90',
      icon: Cpu,
    },
    {
      id: 'mrp',
      stepNumber: '05',
      acronym: 'MRP',
      title: 'Material Explosion',
      horizon: '1 - 12 Weeks',
      granularity: 'BOM Components',
      keyStat: `${mrpActionCount} Orders`,
      keyStatLabel: 'Supplier Actions',
      statusBadge: `${mrpActionCount} Actions`,
      accentBg: 'bg-[#f5effe]/90',
      accentPill: 'bg-[#DDCBF5]',
      icon: Boxes,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Sleek Stage Header Banner with View Toggle */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7AFFA1]"></span>
            <span className="text-black font-extrabold">Executive Command Center</span>
            <span className="text-slate-300">·</span>
            <span>Scenario: <strong className="text-black capitalize font-extrabold">{scenario}</strong></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <span>Operations Flow & Global Intelligence</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7AFFA1] text-black shrink-0">
              Live Loop
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl font-medium">
            Unified telemetry synchronizing long-range commercial consensus (S&OP), distribution replenishment (DRP), assembly master scheduling (MPS), shop floor capacity (CRP), and raw material procurement (MRP).
          </p>
        </div>

        {/* View Switcher Capsule & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 rounded-full glass-pill">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#7AFFA1]" />
              <span>Global Stats Dashboard</span>
            </button>
            <button
              onClick={() => setActiveView('architecture')}
              className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'architecture'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Architecture Stages</span>
            </button>
          </div>

          {onOpenScenarioModal && (
            <button
              onClick={onOpenScenarioModal}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-800 glass-pill hover:bg-white rounded-full transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Scenario Diff</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Executive Stats Ribbon (Available in both views for instant scannability) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Total Revenue (Mint) */}
        <div
          onClick={() => onSelectStep('sop')}
          className="glass-card glass-card-hover rounded-3xl p-4.5 space-y-1.5 border border-white/80 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Projected Pipeline</span>
            <div className="w-6 h-6 rounded-full bg-[#7AFFA1] flex items-center justify-center text-black shadow-2xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
            ${(totalRevenueUSD / 1000000).toFixed(2)}M
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Consensus Margin: <strong className="text-black font-semibold">{avgMargin}%</strong></span>
            <span className="text-[10px] text-emerald-800 bg-[#7AFFA1]/40 px-2 py-0.5 rounded-full font-bold">
              {totalConsensusUnits.toLocaleString()} units
            </span>
          </div>
        </div>

        {/* Metric 2: Network Distribution & Fulfillment (Yellow) */}
        <div
          onClick={() => onSelectStep('drp')}
          className="glass-card glass-card-hover rounded-3xl p-4.5 space-y-1.5 border border-white/80 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Depot Network Delivery</span>
            <div className="w-6 h-6 rounded-full bg-[#FFF87C] flex items-center justify-center text-black shadow-2xs group-hover:scale-105 transition-transform">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
            98.6%
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>3 Active Regional DCs</span>
            <span className="text-[10px] text-black bg-[#FFF87C] px-2 py-0.5 rounded-full font-bold">
              {totalPlannedDRPReleases.toLocaleString()} units pull
            </span>
          </div>
        </div>

        {/* Metric 3: Machine & Shop Floor Capacity (Coral/Mint) */}
        <div
          onClick={() => onSelectStep('crp')}
          className="glass-card glass-card-hover rounded-3xl p-4.5 space-y-1.5 border border-white/80 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Peak Machine Load</span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-black shadow-2xs group-hover:scale-105 transition-transform ${
                maxWorkCenterUtil > 100 ? 'bg-[#FFA27D]' : 'bg-[#7AFFA1]'
              }`}
            >
              {maxWorkCenterUtil > 100 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight font-sans ${maxWorkCenterUtil > 100 ? 'text-[#FFA27D]' : 'text-black'}`}>
            {maxWorkCenterUtil}%
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{bottleneckWorkCenter ? `${bottleneckWorkCenter.workCenter.code} Bottleneck` : 'All Cells Balanced'}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                maxWorkCenterUtil > 100
                  ? 'bg-[#FFA27D] text-black'
                  : 'bg-[#7AFFA1]/50 text-emerald-950'
              }`}
            >
              {totalShopHours}h Load
            </span>
          </div>
        </div>

        {/* Metric 4: Material BOM Spend & Supplier Reliability (Lavender) */}
        <div
          onClick={() => onSelectStep('mrp')}
          className="glass-card glass-card-hover rounded-3xl p-4.5 space-y-1.5 border border-white/80 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Material Procurement</span>
            <div className="w-6 h-6 rounded-full bg-[#DDCBF5] flex items-center justify-center text-black shadow-2xs group-hover:scale-105 transition-transform">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans">
            ${(totalCommittedSpend / 1000).toFixed(0)}K
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Supplier On-Time: <strong className="text-black font-semibold">{avgSupplierReliability}%</strong></span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                pendingActionsList.length > 0
                  ? 'bg-[#FFA27D] text-black'
                  : 'bg-[#DDCBF5] text-black'
              }`}
            >
              {pendingActionsList.length} Action Orders
            </span>
          </div>
        </div>
      </div>

      {/* DASHBOARD VIEW: In-Depth Operational Diagnostics */}
      {activeView === 'dashboard' && (
        <div className="space-y-5">
          {/* End-to-End Operational Pipeline Throughput Funnel */}
          <div className="glass-panel rounded-3xl p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-black flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-700" />
                  <span>End-to-End Volume Throughput & Handoff Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Real-time unit conversion and reconciliation across tactical, distribution, master scheduling, and supply stages
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-white/70 px-3 py-1 rounded-full border border-white/80 self-start sm:self-auto">
                Closed-Loop Reconciled
              </span>
            </div>

            {/* Visual Funnel / Flow Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {steps.map((step, idx) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    onClick={() => onSelectStep(step.id)}
                    className="p-3.5 rounded-2xl glass-card border border-white/80 hover:bg-white/90 transition-all cursor-pointer group space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-slate-400">
                        STEP {step.stepNumber}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${step.accentPill} text-black shrink-0`}
                      >
                        {step.statusBadge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-xl ${step.accentBg} flex items-center justify-center text-black font-bold group-hover:bg-slate-950 group-hover:text-[#7AFFA1] transition-all shrink-0`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 group-hover:text-black truncate">
                          {step.acronym}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {step.title}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-black/5 flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {step.keyStatLabel}:
                      </span>
                      <span className="font-mono text-xs font-black text-black">
                        {step.keyStat}
                      </span>
                    </div>

                    {idx < steps.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cross-Stage Health & Diagnostics Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card: Demand vs Demonstrated Capacity Reconciliation */}
            <div className="glass-panel rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-black flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-slate-700" />
                    <span>Demand vs Plant Demonstrated Capacity</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rolling 6-month aggregate throughput threshold
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#7AFFA1]/40 text-emerald-950 px-2.5 py-0.5 rounded-full">
                  {Math.round((totalConsensusUnits / totalDemonstratedCapacity) * 100)}% Absorbed
                </span>
              </div>

              {/* Progress Comparison */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 font-semibold mb-1">
                    <span>Unconstrained Demand Consensus</span>
                    <span className="font-mono text-black font-bold">{totalConsensusUnits.toLocaleString()} units</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-black/5">
                    <div
                      className="h-full bg-[#7AFFA1] rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalConsensusUnits / totalDemonstratedCapacity) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 font-semibold mb-1">
                    <span>Master Factory Assembly Ceiling</span>
                    <span className="font-mono text-black font-bold">{totalDemonstratedCapacity.toLocaleString()} units</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-black/5">
                    <div
                      className="h-full bg-[#DDCBF5] rounded-full transition-all"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 font-semibold mb-1">
                    <span>Firm Customer Order Bookings</span>
                    <span className="font-mono text-black font-bold">{totalFirmCustomerOrders.toLocaleString()} units ({Math.round((totalFirmCustomerOrders / totalConsensusUnits) * 100)}% booked)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-black/5">
                    <div
                      className="h-full bg-[#FFF87C] rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalFirmCustomerOrders / totalConsensusUnits) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Available-to-Promise Buffer:</span>
                <span className="font-mono font-black text-black bg-[#7AFFA1]/35 px-2.5 py-0.5 rounded-full">
                  +{cumulativeATPFinal} units uncommitted
                </span>
              </div>
            </div>

            {/* Right Card: Critical Exceptions & Bottleneck Diagnostics */}
            <div className="glass-panel rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-black flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-700" />
                    <span>Real-Time Operational Bottlenecks & Alerts</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exceptions requiring planner resolution across stages
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#FFA27D] text-black px-2.5 py-0.5 rounded-full">
                  {pendingActionsList.length + (maxWorkCenterUtil > 100 ? 1 : 0)} Active
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {maxWorkCenterUtil > 100 && (
                  <div className="p-3 rounded-2xl bg-[#ffefe8] border border-[#FFA27D]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-[#FFA27D] flex items-center justify-center text-black font-bold shrink-0">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-black truncate">
                          CRP Bottleneck: {bottleneckWorkCenter?.workCenter.name} ({maxWorkCenterUtil}%)
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          Week 42 exceeds rated weekly hours by 23.6 hours.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectStep('crp')}
                      className="px-3 py-1 rounded-full text-[11px] font-bold text-white bg-slate-950 hover:bg-black shrink-0 cursor-pointer shadow-2xs"
                    >
                      Resolve CRP
                    </button>
                  </div>
                )}

                {pendingActionsList.slice(0, 2).map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-2xl bg-white/70 border border-white/90 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-[#DDCBF5] flex items-center justify-center text-black font-bold shrink-0">
                        <Boxes className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-black truncate">
                          MRP Signal: {action.type} {action.partNumber}
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          Due: {action.weekRequired} · Supplier: {action.supplier}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectStep('mrp')}
                      className="px-3 py-1 rounded-full text-[11px] font-bold text-black bg-[#FFF87C] hover:opacity-90 shrink-0 cursor-pointer shadow-2xs"
                    >
                      Review MRP
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Autonomous loop checks every pipeline regeneration</span>
                </span>
                {onRunRegeneration && (
                  <button
                    onClick={onRunRegeneration}
                    className="text-xs font-bold text-black hover:underline cursor-pointer"
                  >
                    Trigger Recalculation →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARCHITECTURE VIEW: Sequential Process Flow Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Workflow className="w-4 h-4 text-black" />
            <span>Interactive Operations Stages</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Click any stage to enter specialized planning workbench</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className="glass-card glass-card-hover rounded-3xl p-4.5 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 gap-2">
                    <span className="font-mono text-[11px] font-black text-slate-400 shrink-0">
                      STAGE {step.stepNumber}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${step.accentPill} text-black shrink-0 shadow-2xs whitespace-nowrap`}
                    >
                      {step.statusBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-3.5">
                    <div
                      className={`w-9 h-9 rounded-2xl ${step.accentBg} flex items-center justify-center text-black font-bold group-hover:bg-slate-950 group-hover:text-[#7AFFA1] transition-all shadow-2xs shrink-0 border border-white/60`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-black text-slate-900 group-hover:text-black tracking-tight truncate">
                        {step.acronym}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 leading-tight truncate">
                        {step.title}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs">
                    <div className="bg-white/60 rounded-xl p-2 border border-white/70">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Horizon</span>
                      <span className="text-slate-800 font-mono text-[11px] font-bold">{step.horizon}</span>
                    </div>

                    <div className="bg-white/60 rounded-xl p-2 border border-white/70">
                      <span className="text-slate-400 block text-[9px] font-bold uppercase">Throughput</span>
                      <span className="text-slate-900 font-mono text-[11px] font-bold truncate block">{step.keyStat}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-black/5 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-black">
                  <span>Enter Stage</span>
                  <div className="w-6 h-6 rounded-full bg-white/80 group-hover:bg-slate-950 group-hover:text-[#7AFFA1] flex items-center justify-center transition-all shadow-2xs border border-white/80">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Concurrent Closed-Loop Feedback Architecture Card */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bidirectional Feedback Loops
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              Closed-Loop Enterprise Synchronization
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-950 bg-[#7AFFA1]/40 px-3 py-1 rounded-full self-start sm:self-auto border border-[#7AFFA1]/50">
            Automated Rebalancing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="glass-card rounded-2xl p-4 space-y-2 border border-white/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#7AFFA1] flex items-center justify-center text-black font-bold text-xs shrink-0">
                1
              </div>
              <span className="text-xs font-black text-slate-900">Demand Disaggregation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Consensus revenue and volume targets from S&OP disaggregate into regional DRP distribution depot demands.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-2 border border-white/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#FFF87C] flex items-center justify-center text-black font-bold text-xs shrink-0">
                2
              </div>
              <span className="text-xs font-black text-slate-900">Capacity Feasibility</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Master schedule requirements finitely loaded against factory machines. Bottlenecks trigger automated shifts.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 space-y-2 border border-white/80">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#DDCBF5] flex items-center justify-center text-black font-bold text-xs shrink-0">
                3
              </div>
              <span className="text-xs font-black text-slate-900">Material PO Signals</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              BOM explodes down component tiers, generating purchase releases with backward supplier lead-time offsets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
