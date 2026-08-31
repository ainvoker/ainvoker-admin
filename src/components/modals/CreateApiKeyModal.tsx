import React, { useState } from 'react';
import { X, Key } from 'lucide-react';
import { ApiKeyItem } from '../../types';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (key: Partial<ApiKeyItem>) => void;
}

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [rpmLimit, setRpmLimit] = useState(600);
  const [tpmLimit, setTpmLimit] = useState(100000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const keyPrefix = `ainv_live_${Math.random().toString(36).substring(2, 7)}...${randomSuffix}`;

    onCreate({
      name: name.trim(),
      keyPrefix,
      projectId: 'platform',
      projectName: 'Platform',
      rpmLimit: Number(rpmLimit),
      tpmLimit: Number(tpmLimit),
      lastUsed: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#fafafa]">
              <Key size={14} />
            </div>
            <h3 className="text-sm font-bold text-[#fafafa]">Generate API Key</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-[#fafafa] p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#fafafa] mb-1">
              Key Name / Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js Frontend Ingress"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#fafafa] mb-1">
                RPM Limit (Req/min)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                value={rpmLimit}
                onChange={(e) => setRpmLimit(Number(e.target.value))}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#fafafa] mb-1">
                TPM Limit (Tokens/min)
              </label>
              <input
                type="number"
                min="1000"
                max="1000000"
                step="1000"
                value={tpmLimit}
                onChange={(e) => setTpmLimit(Number(e.target.value))}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] focus:outline-none focus:border-[#3f3f46] font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-3.5 py-1.5 rounded-md transition-colors shadow-xs"
            >
              Generate Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
