import React from 'react';
import { Folder, ArrowRight, Plus, Key } from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  onNavigateToProjects: () => void;
  onCreateProject: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onNavigateToProjects,
  onCreateProject,
}) => {
  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#fafafa] tracking-tight">
          Projects
        </h3>
        <button
          onClick={onNavigateToProjects}
          className="text-xs font-semibold text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          View all
        </button>
      </div>

      {/* Content Container */}
      {!hasProjects ? (
        /* Exact empty state from the reference screenshot with High Density styling */
        <div
          id="projects-empty-state"
          className="border border-dashed border-[#27272a] rounded-xl p-12 bg-[#18181b]/50 flex flex-col items-center justify-center text-center transition-colors hover:border-[#3f3f46]"
        >
          <div className="w-10 h-10 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#a1a1aa] mb-2.5">
            <Folder size={18} className="stroke-[1.5]" />
          </div>
          <h4 className="text-sm font-bold text-[#fafafa]">
            No projects yet
          </h4>
          <p className="text-xs text-[#a1a1aa] mt-0.5 max-w-sm">
            Create a project to start issuing API keys and logging traffic.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              id="go-to-projects-btn"
              onClick={onNavigateToProjects}
              className="text-xs font-semibold text-[#fafafa] hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              Go to projects <ArrowRight size={12} />
            </button>
            <span className="text-[#3f3f46]">·</span>
            <button
              onClick={onCreateProject}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Quick Create
            </button>
          </div>
        </div>
      ) : (
        /* Active Projects Cards List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-7 h-7 rounded-md bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-[#fafafa]">
                    <Folder size={14} />
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                    {p.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#fafafa] mt-2.5 group-hover:text-white">
                  {p.name}
                </h4>
                <p className="text-[11px] font-mono text-[#71717a] mt-0.5">
                  {p.slug}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#27272a] flex items-center justify-between text-xs text-[#a1a1aa]">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Key size={11} /> {p.apiKeysCount} {p.apiKeysCount === 1 ? 'key' : 'keys'}
                </span>
                <span className="font-mono text-[11px]">
                  {p.requestCount.toLocaleString()} reqs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
