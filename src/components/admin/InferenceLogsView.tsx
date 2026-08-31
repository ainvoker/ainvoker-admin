import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { InferenceLog } from '../../types';

interface InferenceLogsViewProps {
  logs: InferenceLog[];
  onTriggerSimulatedRequest: () => void;
}

export const InferenceLogsView: React.FC<InferenceLogsViewProps> = ({
  logs,
  onTriggerSimulatedRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === '200'
        ? log.statusCode === 200
        : log.statusCode !== 200;

    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.model.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Stream Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]"
            />
            <input
              type="text"
              placeholder="Filter by Request ID, Scope, or Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#18181b] border border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46]"
          >
            <option value="all">All Statuses</option>
            <option value="200">200 OK</option>
            <option value="errors">4xx / 5xx Errors</option>
          </select>
        </div>

        <button
          onClick={onTriggerSimulatedRequest}
          className="bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-semibold px-3 py-1.5 rounded-md border border-[#27272a] flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw size={12} className="text-emerald-400" /> Send Test Invocation
        </button>
      </div>

      {/* Inference Logs Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121215] border-b border-[#27272a] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Request ID</th>
                <th className="px-4 py-2.5">Scope</th>
                <th className="px-4 py-2.5">Model</th>
                <th className="px-4 py-2.5">Latency</th>
                <th className="px-4 py-2.5">Tokens (In / Out)</th>
                <th className="px-4 py-2.5 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[#27272a]/40 transition-colors"
                >
                  {/* Timestamp */}
                  <td className="px-4 py-2 text-[#71717a] font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.statusCode === 200
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {log.statusCode === 200 ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <AlertCircle size={10} />
                      )}
                      {log.statusCode}
                    </span>
                  </td>

                  {/* Request ID */}
                  <td className="px-4 py-2 text-[#fafafa] font-semibold">
                    {log.id}
                  </td>

                  {/* Project */}
                  <td className="px-4 py-2 font-sans text-[#fafafa] font-medium">
                    {log.projectName}
                  </td>

                  {/* Model */}
                  <td className="px-4 py-2 text-[#a1a1aa]">
                    {log.model}
                  </td>

                  {/* Latency */}
                  <td className="px-4 py-2 text-[#71717a]">
                    {log.latencyMs} ms
                  </td>

                  {/* Tokens */}
                  <td className="px-4 py-2 text-[#a1a1aa]">
                    {log.promptTokens} / {log.completionTokens} ({log.totalTokens})
                  </td>

                  {/* Cost */}
                  <td className="px-4 py-2 text-right text-[#fafafa]">
                    ${log.costUsd.toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
