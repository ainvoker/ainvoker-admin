import React, { useState } from 'react';
import { Key, Plus, Copy, Check } from 'lucide-react';
import { ApiKeyItem } from '../../types';

interface ApiKeysViewProps {
  apiKeys: ApiKeyItem[];
  onCreateKey: () => void;
  onRevokeKey: (keyId: string) => void;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({
  apiKeys,
  onCreateKey,
  onRevokeKey,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5">
            <Key size={14} /> API Key Management & Ingress Quotas
          </h3>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            API keys allow your client apps and SDKs to securely invoke the multi-model backend gateway.
          </p>
        </div>
        <button
          onClick={onCreateKey}
          className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={13} /> Create API Key
        </button>
      </div>

      {/* API Keys Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121215] border-b border-[#27272a] text-[#71717a] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Key Prefix</th>
                <th className="px-4 py-2.5">Scope</th>
                <th className="px-4 py-2.5">RPM / TPM Limit</th>
                <th className="px-4 py-2.5">Created</th>
                <th className="px-4 py-2.5">Last Used</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {apiKeys.map((k) => (
                <tr key={k.id} className="hover:bg-[#27272a]/40 transition-colors">
                  <td className="px-4 py-2.5 font-semibold text-[#fafafa]">
                    {k.name}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[#a1a1aa]">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#09090b] border border-[#27272a] px-1.5 py-0.5 rounded text-[11px] text-[#fafafa]">
                        {k.keyPrefix}
                      </span>
                      <button
                        onClick={() => handleCopy(k.id, k.keyPrefix)}
                        className="text-[#71717a] hover:text-[#fafafa] transition-colors"
                        title="Copy Key"
                      >
                        {copiedId === k.id ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#fafafa] font-medium">
                    {k.projectName}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#71717a]">
                    {k.rpmLimit} RPM / {(k.tpmLimit / 1000).toFixed(0)}k TPM
                  </td>
                  <td className="px-4 py-2.5 text-[#71717a] text-[11px]">
                    {k.createdAt}
                  </td>
                  <td className="px-4 py-2.5 text-[#71717a] text-[11px]">
                    {k.lastUsed}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onRevokeKey(k.id)}
                      className="text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 text-[11px] font-medium transition-colors"
                    >
                      Revoke
                    </button>
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
