import React, { useState } from 'react';
import { Save, Shield, Webhook, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [geminiRouting, setGeminiRouting] = useState(true);
  const [autoFallback, setAutoFallback] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.ainvoker.io/webhooks/alerts');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Gateway Proxy Policies */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 space-y-3">
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
            <Shield size={14} /> Gateway Routing & Security Policies
          </h3>

          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-[#fafafa]">Enable Intelligent Auto-Fallback</p>
                <p className="text-[11px] text-[#71717a]">Automatically reroute queries to fallback provider upon 429 or 503 errors.</p>
              </div>
              <input
                type="checkbox"
                checked={autoFallback}
                onChange={(e) => setAutoFallback(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#27272a] border-[#3f3f46] text-white focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-[#fafafa]">Direct Gemini API Fast-Path</p>
                <p className="text-[11px] text-[#71717a]">Route multimodal & reasoning tokens through lowest-latency Google GenAI edge clusters.</p>
              </div>
              <input
                type="checkbox"
                checked={geminiRouting}
                onChange={(e) => setGeminiRouting(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#27272a] border-[#3f3f46] text-white focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Webhooks & Alerts */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4.5 space-y-3">
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
            <Webhook size={14} /> Webhook Notifications & Alerts
          </h3>
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] mb-1">
              Incident & Quota Alert URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {saved ? <Check size={13} className="text-emerald-600" /> : <Save size={13} />}
            {saved ? 'Saved Successfully' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
