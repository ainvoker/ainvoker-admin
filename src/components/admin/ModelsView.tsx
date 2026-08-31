import React from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
import { ModelRoute } from '../../types';

interface ModelsViewProps {
  models: ModelRoute[];
  onToggleModelStatus: (modelId: string) => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  onToggleModelStatus,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
            <Cpu size={14} className="text-white" /> Multi-Model Inference Gateway
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Dynamic load-balancing across Google AI Studio, OpenAI, Anthropic, and DeepSeek endpoints with automatic fallback routing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All Endpoints Operational
          </span>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    {model.provider}
                  </span>
                  <h4 className="text-sm font-bold text-[#fafafa] mt-0.5">
                    {model.name}
                  </h4>
                  <span className="text-[11px] font-mono text-[#71717a] block mt-0.5">
                    {model.modelId}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    model.status === 'operational'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                  }`}
                >
                  <CheckCircle2 size={10} />
                  {model.status}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-[#27272a]">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-semibold">
                    Avg Latency
                  </span>
                  <p className="text-xs font-bold font-mono text-[#fafafa] mt-0.5">
                    {model.avgLatencyMs} ms
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-semibold">
                    Success Rate
                  </span>
                  <p className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
                    {model.successRate}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-semibold">
                    Cost / 1K In
                  </span>
                  <p className="text-xs font-mono text-[#a1a1aa] mt-0.5">
                    ${model.costPer1kInput.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-semibold">
                    Cost / 1K Out
                  </span>
                  <p className="text-xs font-mono text-[#a1a1aa] mt-0.5">
                    ${model.costPer1kOutput.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3.5 pt-2.5 border-t border-[#27272a] flex items-center justify-between">
              <span className="text-[11px] text-[#71717a] font-mono">
                {model.totalCallsMonth.toLocaleString()} calls
              </span>
              <button
                onClick={() => onToggleModelStatus(model.id)}
                className="text-xs font-semibold text-[#fafafa] hover:text-white px-2 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] transition-colors"
              >
                {model.status === 'operational' ? 'Set Maintenance' : 'Resume'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
