import React, { useState } from 'react';
import { Folder, Plus, Search, Key, Archive } from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectsViewProps {
  projects: ProjectItem[];
  onCreateProject: () => void;
  onArchiveProject: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onCreateProject,
  onArchiveProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]"
          />
          <input
            type="text"
            placeholder="Search projects by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18181b] border border-[#27272a] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
          />
        </div>

        <button
          onClick={onCreateProject}
          className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={13} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-md bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#fafafa]">
                  <Folder size={15} />
                </div>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  {project.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#fafafa] mt-2.5">
                {project.name}
              </h4>
              <p className="text-xs font-mono text-[#71717a] mt-0.5">
                {project.slug}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-3.5 pt-2.5 border-t border-[#27272a]">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-semibold">
                    Invocations
                  </span>
                  <p className="text-xs font-mono font-bold text-[#fafafa]">
                    {project.requestCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-semibold">
                    Total Tokens
                  </span>
                  <p className="text-xs font-mono font-bold text-[#a1a1aa]">
                    {(project.tokenCount / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-[#27272a] flex items-center justify-between">
              <span className="text-[11px] text-[#71717a] flex items-center gap-1 font-mono">
                <Key size={11} /> {project.apiKeysCount} Keys
              </span>
              <button
                onClick={() => onArchiveProject(project.id)}
                className="text-[#71717a] hover:text-rose-400 transition-colors p-1"
                title="Archive Project"
              >
                <Archive size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
