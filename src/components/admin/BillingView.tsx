import React from 'react';
import { Check } from 'lucide-react';

export const BillingView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Current Plan Overview */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-1.5 py-0.2 rounded">
            Active Subscription
          </span>
          <h3 className="text-base font-bold text-[#fafafa] mt-1.5">
            Free Developer Plan
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-lg">
            300 requests/month and 50,000 tokens included. Upgrade to Pro or Enterprise for unlimited multi-model pooling and 99.99% uptime SLA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 rounded-md transition-colors shadow-xs">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Free */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#fafafa]">Free Developer</h4>
            <div className="text-xl font-extrabold text-[#fafafa] mt-1.5">$0<span className="text-xs text-[#71717a] font-normal"> / mo</span></div>
            <ul className="space-y-1.5 mt-3.5 text-xs text-[#a1a1aa]">
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 300 Requests / month</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 50,000 Tokens / month</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Google Gemini & GPT-4o access</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Community support</li>
            </ul>
          </div>
          <button className="w-full mt-4 bg-[#27272a] text-[#71717a] text-xs font-medium py-1.5 rounded-md border border-[#3f3f46] cursor-not-allowed">
            Current Tier
          </button>
        </div>

        {/* Pro */}
        <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-4.5 flex flex-col justify-between relative shadow-md">
          <div className="absolute -top-2 right-4 bg-white text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
            Popular
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#fafafa]">Pro Gateway</h4>
            <div className="text-xl font-extrabold text-[#fafafa] mt-1.5">$49<span className="text-xs text-[#71717a] font-normal"> / mo</span></div>
            <ul className="space-y-1.5 mt-3.5 text-xs text-[#a1a1aa]">
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 500,000 Requests / month</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 100M Tokens / month</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Multi-region failover</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Custom rate limit tiers</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Real-time log exporter</li>
            </ul>
          </div>
          <button className="w-full mt-4 bg-white hover:bg-neutral-200 text-black text-xs font-semibold py-1.5 rounded-md transition-colors">
            Upgrade to Pro
          </button>
        </div>

        {/* Enterprise */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#fafafa]">Custom Enterprise</h4>
            <div className="text-xl font-extrabold text-[#fafafa] mt-1.5">Custom<span className="text-xs text-[#71717a] font-normal"> / quote</span></div>
            <ul className="space-y-1.5 mt-3.5 text-xs text-[#a1a1aa]">
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Unlimited Invocations</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Dedicated Edge Nodes</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> Bring Your Own Cloud Keys</li>
              <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-400" /> 99.99% Guaranteed SLA</li>
            </ul>
          </div>
          <button className="w-full mt-4 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-xs font-semibold py-1.5 rounded-md border border-[#3f3f46] transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};
