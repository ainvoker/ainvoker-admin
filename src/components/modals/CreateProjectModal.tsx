import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { ProjectItem } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Partial<ProjectItem>) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString().split('T')[0],
      requestCount: 0,
      tokenCount: 0,
      status: 'active',
      apiKeysCount: 1,
    });
    setName('');
    setSlug('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#fafafa]">
              <FolderPlus size={14} />
            </div>
            <h3 className="text-sm font-bold text-[#fafafa]">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-[#fafafa] p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-xs text-[#a1a1aa]">
          Projects group API keys, rate limits, and model routing policies for a specific client application.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#fafafa] mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mobile Chat Agent"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#fafafa] mb-1">
              Project Slug
            </label>
            <input
              type="text"
              required
              placeholder="mobile-chat-agent"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46] font-mono"
            />
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
