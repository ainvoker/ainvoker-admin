import React from 'react';
import { ShieldCheck, Radio } from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  const nodes = [
    { name: 'Gateway Edge us-east4', status: 'Healthy', load: '14%', rps: '184 req/s', p99: '210ms' },
    { name: 'Gateway Edge asia-southeast1', status: 'Healthy', load: '22%', rps: '340 req/s', p99: '185ms' },
    { name: 'Gateway Edge europe-west1', status: 'Healthy', load: '9%', rps: '92 req/s', p99: '230ms' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Telemetry Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Gateway Ingress
          </span>
          <div className="text-xl font-extrabold text-[#fafafa] mt-1">
            616 req/s
          </div>
          <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
            <ShieldCheck size={12} /> 100% Edge Availability
          </p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Redis Cache Hit Rate
          </span>
          <div className="text-xl font-extrabold text-[#fafafa] mt-1">
            94.2%
          </div>
          <p className="text-xs text-[#71717a] mt-1.5">
            5.8% upstream provider pass-through
          </p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Global P95 Latency
          </span>
          <div className="text-xl font-extrabold text-[#fafafa] mt-1">
            218 ms
          </div>
          <p className="text-xs text-[#71717a] mt-1.5">
            Within SLA target (&lt;500ms)
          </p>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Memory & Queue
          </span>
          <div className="text-xl font-extrabold text-[#fafafa] mt-1">
            0 pending
          </div>
          <p className="text-xs text-emerald-400 mt-1.5">
            No backlog congestion
          </p>
        </div>
      </div>

      {/* Edge Worker Nodes */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5">
        <h3 className="text-xs font-bold text-[#fafafa] mb-3 flex items-center gap-1.5">
          <Radio size={14} className="text-emerald-400" /> Active Edge Proxy Nodes
        </h3>
        <div className="space-y-2">
          {nodes.map((node, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <p className="font-semibold text-[#fafafa]">{node.name}</p>
                  <p className="text-[10px] text-[#71717a] font-mono">Load: {node.load}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 font-mono text-[#a1a1aa] text-xs">
                <span>{node.rps}</span>
                <span>P99: {node.p99}</span>
                <span className="text-emerald-400 font-sans font-semibold text-[10px] bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/50">
                  {node.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
