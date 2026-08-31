import React from 'react';

interface PlanUsageCardProps {
  planName?: string;
  planStatus?: string;
  requestsUsed?: number;
  requestsLimit?: number;
  tokensUsed?: number;
  tokensLimit?: number;
}

export const PlanUsageCard: React.FC<PlanUsageCardProps> = ({
  planName = 'free',
  planStatus = 'ACTIVE',
  requestsUsed = 0,
  requestsLimit = 300,
  tokensUsed = 0,
  tokensLimit = 50000,
}) => {
  const reqPct = Math.min(100, Math.round((requestsUsed / (requestsLimit || 1)) * 100));
  const tokenPct = Math.min(100, Math.round((tokensUsed / (tokensLimit || 1)) * 100));

  return (
    <div
      id="plan-usage-card"
      className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 hover:border-[#3f3f46] transition-colors"
    >
      {/* Title & Status */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#fafafa] tracking-tight">
          Plan usage
        </h3>
        <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
          <span className="lowercase">{planName}</span> · <span className="uppercase font-semibold tracking-wider text-[#a1a1aa]">{planStatus}</span>
        </p>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* Requests Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#a1a1aa] font-medium">Requests this month</span>
            <span className="text-[#fafafa] font-mono text-xs">
              {requestsUsed.toLocaleString()} / {requestsLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#fafafa] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(reqPct, 0)}%` }}
            />
          </div>
        </div>

        {/* Tokens Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#a1a1aa] font-medium">Tokens this month</span>
            <span className="text-[#fafafa] font-mono text-xs">
              {tokensUsed.toLocaleString()} / {tokensLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#fafafa] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(tokenPct, 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-2.5 border-t border-[#27272a]">
        <p className="text-[11px] text-[#71717a] font-mono">
          Period usage: {requestsUsed.toLocaleString()} requests · {tokensUsed.toLocaleString()} tokens
        </p>
      </div>
    </div>
  );
};
