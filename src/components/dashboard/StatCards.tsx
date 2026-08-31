import React from 'react';

interface StatCardsProps {
  requestsCount?: number;
  tokensCount?: number;
  successRate?: string | number;
  okCount?: number;
  failedCount?: number;
  isMockActive?: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  requestsCount = 0,
  tokensCount = 0,
  successRate = '—',
  okCount = 0,
  failedCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {/* 1. Requests Card */}
      <div
        id="stat-card-requests"
        className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors"
      >
        <div>
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Requests (Month)
          </span>
          <div className="text-2xl font-extrabold text-[#fafafa] mt-1.5 tracking-tight">
            {requestsCount.toLocaleString()}
          </div>
        </div>
        <p className="text-[11px] text-[#71717a] mt-3">
          Counted toward plan limits
        </p>
      </div>

      {/* 2. Tokens Card */}
      <div
        id="stat-card-tokens"
        className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors"
      >
        <div>
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Tokens (Month)
          </span>
          <div className="text-2xl font-extrabold text-[#fafafa] mt-1.5 tracking-tight">
            {tokensCount.toLocaleString()}
          </div>
        </div>
        <p className="text-[11px] text-[#71717a] mt-3">
          Input + output
        </p>
      </div>

      {/* 3. Success Rate Card */}
      <div
        id="stat-card-success-rate"
        className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors"
      >
        <div>
          <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">
            Success Rate
          </span>
          <div className="text-2xl font-extrabold text-[#fafafa] mt-1.5 tracking-tight">
            {successRate}
          </div>
        </div>
        <p className="text-[11px] text-[#71717a] mt-3">
          {okCount} ok · {failedCount} failed
        </p>
      </div>

    </div>
  );
};
