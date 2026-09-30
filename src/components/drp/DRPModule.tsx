import React, { useState } from 'react';
import { DistributionCenter, DRPReplenishmentRow } from '../../types/demand';
import {
  ArrowRight,
  MapPin,
  PackageCheck,
  Share2,
  Box,
  ArrowRightLeft,
  X,
} from 'lucide-react';

interface DRPModuleProps {
  depots: DistributionCenter[];
  rows: DRPReplenishmentRow[];
  onUpdateRows: (newRows: DRPReplenishmentRow[]) => void;
  onPromoteToMPS: () => void;
}

export const DRPModule: React.FC<DRPModuleProps> = ({
  depots,
  rows,
  onUpdateRows,
  onPromoteToMPS,
}) => {
  const [selectedDepotId, setSelectedDepotId] = useState<string>('all');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSource, setTransferSource] = useState('rdc-east');
  const [transferTarget, setTransferTarget] = useState('rdc-west');
  const [transferQty, setTransferQty] = useState(50);
  const [transferNotice, setTransferNotice] = useState<string | null>(null);

  const filteredRows =
    selectedDepotId === 'all'
      ? rows
      : rows.filter((r) => r.depotId === selectedDepotId);

  const totalWeeklyReleases = rows.reduce(
    (acc, row) => {
      row.periods.forEach((p, idx) => {
        acc[idx] = (acc[idx] || 0) + p.plannedOrderRelease;
      });
      return acc;
    },
    {} as Record<number, number>
  );

  const handleExecuteTransfer = () => {
    const updated = rows.map((row) => {
      if (row.depotId === transferSource) {
        const newPeriods = [...row.periods];
        newPeriods[0] = {
          ...newPeriods[0],
          projectedOnHand: Math.max(0, newPeriods[0].projectedOnHand - transferQty),
        };
        return { ...row, periods: newPeriods };
      }
      if (row.depotId === transferTarget) {
        const newPeriods = [...row.periods];
        newPeriods[1] = {
          ...newPeriods[1],
          scheduledReceipts: newPeriods[1].scheduledReceipts + transferQty,
          projectedOnHand: newPeriods[1].projectedOnHand + transferQty,
          netRequirement: Math.max(0, newPeriods[1].netRequirement - transferQty),
        };
        return { ...row, periods: newPeriods };
      }
      return row;
    });

    onUpdateRows(updated);
    setTransferNotice(`Rebalanced ${transferQty} units from ${transferSource.toUpperCase()} to ${transferTarget.toUpperCase()}. In-transit dispatch scheduled.`);
    setTransferModalOpen(false);
    setTimeout(() => setTransferNotice(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Sleek Stage Header Banner */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FFF87C]"></span>
            <span className="text-black font-extrabold">Stage 02</span>
            <span className="text-slate-300">·</span>
            <span>Multi-Echelon Distribution Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex flex-wrap items-center gap-3">
            <span>Distribution Requirements Planning (DRP)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Time-phase regional depot replenishment, track in-transit pipelines, and aggregate demand into factory master pull.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-black bg-[#FFF87C] hover:opacity-90 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Inter-Depot Transfer</span>
          </button>

          <button
            onClick={onPromoteToMPS}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-black rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <span>Consolidate into MPS</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7AFFA1]" />
          </button>
        </div>
      </div>

      {transferNotice && (
        <div className="bg-[#7AFFA1]/40 border border-[#7AFFA1] text-black text-xs px-5 py-2.5 rounded-full flex items-center gap-2.5 font-bold shadow-xs">
          <PackageCheck className="w-4 h-4 text-black shrink-0" />
          <span>{transferNotice}</span>
        </div>
      )}

      {/* Network Topology Visualization */}
      <div className="glass-panel rounded-3xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-black flex items-center gap-2">
              <Share2 className="w-4 h-4 text-slate-700" />
              <span>Multi-Echelon Distribution Hubs</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Replenishment pipelines linking Detroit Master Plant with regional distribution centers
            </p>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="font-semibold">Filter:</span>
            <select
              value={selectedDepotId}
              onChange={(e) => setSelectedDepotId(e.target.value)}
              className="bg-white/80 border border-slate-200 text-black text-xs font-semibold rounded-full px-3 py-1 focus:outline-none glass-pill cursor-pointer"
            >
              <option value="all">All Regional Depots (3)</option>
              <option value="rdc-east">East Coast DC (Allentown, PA)</option>
              <option value="rdc-midwest">Midwest Regional (Joliet, IL)</option>
              <option value="rdc-west">Pacific West (Ontario, CA)</option>
            </select>
          </div>
        </div>

        {/* Node Diagram */}
        <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 items-center">
            {/* Center: Master Central Plant */}
            <div className="lg:col-span-1 p-4.5 rounded-2xl glass-card border-2 border-[#7AFFA1] relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-black">
                <Box className="w-4 h-4 text-emerald-600" />
                <span>CDC-01 · DETROIT</span>
              </div>
              <h4 className="text-base font-black text-black mt-1">
                Central Plant & Hub
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Assembly Line SD-120P
              </p>

              <div className="mt-3.5 pt-2.5 border-t border-black/5 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Hub Stock:</span>
                  <span className="font-mono text-black font-extrabold">480 units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Safety Buffer:</span>
                  <span className="font-mono text-slate-700 font-bold">180 units</span>
                </div>
              </div>
            </div>

            {/* Regional Forward Nodes */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {depots.slice(1, 4).map((depot) => {
                const isSelected = selectedDepotId === depot.id;

                return (
                  <div
                    key={depot.id}
                    onClick={() => setSelectedDepotId(depot.id)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'glass-card border-black ring-2 ring-black/10 shadow-md'
                        : 'glass-card hover:bg-white/80 border-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {depot.type}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-900 bg-[#7AFFA1]/50 px-2 py-0.5 rounded-full">
                        Lead: {depot.transitLeadTimeDays}d
                      </span>
                    </div>

                    <h5 className="font-black text-black text-sm mt-1.5 truncate">
                      {depot.name}
                    </h5>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{depot.location}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">On-Hand:</span>
                      <span className="font-mono font-bold text-black">{depot.currentInventory} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DRP Multi-Node Time-Phased Ledger */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-black">
              Time-Phased Distribution Replenishment Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Regional depot gross demand, transit pipelines, and planned factory dispatches
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-white/70 px-3 py-1 rounded-full border border-white/80">
            Planning Horizon: Weeks 40 - 47
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/30 text-slate-400 font-mono text-[11px] uppercase border-b border-black/5">
              <tr>
                <th className="py-2.5 px-5 font-bold min-w-[220px]">
                  Depot Node / Planning Row
                </th>
                {rows[0]?.periods.map((p) => (
                  <th key={p.week} className="py-2.5 px-4 text-right font-bold min-w-[85px]">
                    {p.week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-slate-700">
              {filteredRows.map((row) => {
                const parentDepot = depots.find((d) => d.id === row.depotId);
                const safetyTarget = parentDepot?.safetyStockTarget || 100;
                const leadTime = parentDepot?.transitLeadTimeDays || 2;
                const currentStock = row.periods[0]?.projectedOnHand || 0;

                return (
                  <React.Fragment key={`${row.depotId}-${row.skuId}`}>
                    {/* Depot Section Header */}
                    <tr className="bg-slate-100/60 font-bold">
                      <td
                        colSpan={row.periods.length + 1}
                        className="py-2.5 px-5 text-black font-extrabold flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        <span>{row.depotName}</span>
                        <span className="text-slate-400 font-normal">|</span>
                        <span className="text-[11px] font-mono text-slate-500 font-normal">
                          Initial On-Hand: {currentStock} units · Safety Buffer: {safetyTarget} units · Lead Time: {leadTime} days
                        </span>
                      </td>
                    </tr>

                    {/* Gross Requirements */}
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="py-2 px-5 font-medium text-slate-600 pl-8">Gross Requirements (Demand)</td>
                      {row.periods.map((p) => (
                        <td key={p.week} className="py-2 px-4 text-right font-mono tabular-nums text-slate-600">
                          {p.grossRequirement}
                        </td>
                      ))}
                    </tr>

                    {/* Scheduled Receipts */}
                    <tr className="hover:bg-white/50 transition-colors">
                      <td className="py-2 px-5 font-medium text-slate-600 pl-8">Scheduled In-Transit Receipts</td>
                      {row.periods.map((p) => (
                        <td key={p.week} className="py-2 px-4 text-right font-mono tabular-nums text-slate-500">
                          {p.scheduledReceipts > 0 ? `+${p.scheduledReceipts}` : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Projected On Hand */}
                    <tr className="hover:bg-white/50 transition-colors bg-white/20">
                      <td className="py-2 px-5 font-bold text-black pl-8">Projected Available Balance (PAB)</td>
                      {row.periods.map((p) => (
                        <td
                          key={p.week}
                          className={`py-2 px-4 text-right font-mono tabular-nums font-bold ${
                            p.projectedOnHand < safetyTarget ? 'text-[#FFA27D]' : 'text-slate-900'
                          }`}
                        >
                          {p.projectedOnHand}
                        </td>
                      ))}
                    </tr>

                  {/* Net Requirement */}
                  <tr className="hover:bg-white/50 transition-colors">
                    <td className="py-2 px-5 font-medium text-slate-600 pl-8">Net Requirements</td>
                    {row.periods.map((p) => (
                      <td key={p.week} className="py-2 px-4 text-right font-mono tabular-nums text-slate-400">
                        {p.netRequirement > 0 ? p.netRequirement : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Planned Order Releases */}
                  <tr className="bg-[#fffde3]/40 font-bold hover:bg-[#fffde3]/60 transition-colors">
                    <td className="py-2.5 px-5 text-black pl-8">
                      <div className="flex items-center justify-between gap-2">
                        <span>Planned Order Release (Factory Dispatch)</span>
                        <span className="text-[9px] bg-[#FFF87C] text-black px-2 py-0.5 rounded-full shadow-2xs font-extrabold shrink-0">
                          MPS Demand
                        </span>
                      </div>
                    </td>
                    {row.periods.map((p) => (
                      <td key={p.week} className="py-2.5 px-4 text-right font-mono tabular-nums text-black font-black">
                        {p.plannedOrderRelease > 0 ? (
                          <span className="bg-[#FFF87C] text-black px-2 py-0.5 rounded-full shadow-2xs">
                            {p.plannedOrderRelease}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}

              {/* Total Aggregate Factory Pull */}
              <tr className="bg-slate-950 text-white font-bold">
                <td className="py-3 px-5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7AFFA1] shrink-0"></span>
                    <span className="font-black">TOTAL DRP PLANNED ORDERS RELEASED (AGGREGATE MPS DEMAND)</span>
                  </div>
                </td>
                {rows[0]?.periods.map((_, idx) => (
                  <td key={idx} className="py-3 px-4 text-right font-mono text-xs tabular-nums text-[#7AFFA1] font-black">
                    {totalWeeklyReleases[idx] || 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rebalance Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-white/90">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-black flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-slate-700" />
                <span>Inter-Depot Inventory Transfer</span>
              </h3>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-slate-500 hover:text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Rebalance stock directly between regional distribution centers to avoid factory expedited production runs.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Source Depot (Ship From):</label>
                <select
                  value={transferSource}
                  onChange={(e) => setTransferSource(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-black font-semibold focus:outline-none"
                >
                  <option value="rdc-east">East Coast DC (Allentown, PA) - Available: 240</option>
                  <option value="rdc-midwest">Midwest Regional (Joliet, IL) - Available: 180</option>
                  <option value="rdc-west">Pacific West (Ontario, CA) - Available: 150</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Depot (Receive At):</label>
                <select
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-black font-semibold focus:outline-none"
                >
                  <option value="rdc-west">Pacific West (Ontario, CA) - Needs Buffer</option>
                  <option value="rdc-east">East Coast DC (Allentown, PA)</option>
                  <option value="rdc-midwest">Midwest Regional (Joliet, IL)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Quantity (Units):</label>
                <input
                  type="number"
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-black font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-black/5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-black glass-pill cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-slate-950 hover:bg-black transition-all cursor-pointer shadow-sm"
              >
                Dispatch In-Transit Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
