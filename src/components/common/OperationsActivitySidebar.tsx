import React from 'react';
import {
  Calendar,
  Phone,
  Mail,
  Plus,
  ArrowUpRight,
  Clock,
  Zap,
  Boxes,
  Cpu,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { ProcessStep } from '../../types/demand';

interface OperationsActivitySidebarProps {
  onSelectStep: (step: ProcessStep) => void;
  onResolveBottleneck: () => void;
  onResolveShortage: () => void;
}

export const OperationsActivitySidebar: React.FC<OperationsActivitySidebarProps> = ({
  onSelectStep,
  onResolveBottleneck,
  onResolveShortage,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-[32px] p-6 shadow-[0_10px_35px_rgba(15,23,42,0.03)] space-y-6">
      {/* Top Header with title and circular icon buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-black tracking-tight font-sans">
          Planning Actions
        </h3>

        {/* Small circular quick action buttons matching image */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-full">
          <button
            onClick={() => onSelectStep('sop')}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            title="S&OP Meeting"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectStep('crp')}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            title="Work Center Schedule"
          >
            <Cpu className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectStep('drp')}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            title="Depot Transfer"
          >
            <Truck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectStep('mrp')}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            title="Component Orders"
          >
            <Boxes className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subhead with item count */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
        <span>Upcoming Critical Milestones</span>
        <span className="font-bold text-black font-mono">4 Actions</span>
      </div>

      {/* Colorful rounded cards matching reference images */}
      <div className="space-y-3">
        {/* Soft Lavender Card (#DDCBF5) */}
        <div
          onClick={() => onSelectStep('sop')}
          className="p-4 rounded-2xl bg-[#DDCBF5] text-black transition-all hover:opacity-95 hover:shadow-sm cursor-pointer relative group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-black" />
              </div>
              <span>12 Oct · 10:00 AM</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <h4 className="text-sm font-black mt-2 leading-tight">
            Lock Executive S&OP Consensus Plan
          </h4>
          <p className="text-xs text-black/75 mt-1 leading-snug">
            Reconcile unconstrained commercial forecast with VP of Operations.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-black/80">
            <div className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center text-[10px] font-bold">
              VP
            </div>
            <span>VP Ops & VP Sales · Conf Room 4</span>
          </div>
        </div>

        {/* Soft Butter Yellow Card (#FFF87C) */}
        <div
          onClick={onResolveBottleneck}
          className="p-4 rounded-2xl bg-[#FFF87C] text-black transition-all hover:opacity-95 hover:shadow-sm cursor-pointer relative group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <span>13 Oct · Week 42</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <h4 className="text-sm font-black mt-2 leading-tight">
            Authorize Overtime for CNC Cell (WC-101)
          </h4>
          <p className="text-xs text-black/75 mt-1 leading-snug">
            Peak machine load is 115.7%. Authorize +16h shift to protect MPS.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-black/80">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span>Click to authorize shift & clear bottleneck</span>
          </div>
        </div>

        {/* Soft Coral Peach Card (#FFA27D) */}
        <div
          onClick={onResolveShortage}
          className="p-4 rounded-2xl bg-[#FFA27D] text-black transition-all hover:opacity-95 hover:shadow-sm cursor-pointer relative group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                <Boxes className="w-3.5 h-3.5 text-black" />
              </div>
              <span>15 Oct · W44 Shortage</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <h4 className="text-sm font-black mt-2 leading-tight">
            Expedite PO #8892 (Infineon MOSFET)
          </h4>
          <p className="text-xs text-black/75 mt-1 leading-snug">
            Pull forward 1,000 EA power MOSFET inverters by 1 week to avoid stockout.
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-black/80">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span>Click to transmit expedited PO notice</span>
          </div>
        </div>
      </div>
    </div>
  );
};
