import Mark from '../../assets/mark.svg';
import { sectionGroups } from '../../config/sections';

export function AdminAuthBrandPanel() {
  return (
    <div className="hidden min-h-screen flex-1 items-center justify-center bg-accent px-12 md:flex lg:px-16">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex items-center gap-3">
          <img src={Mark} alt="" className="h-10" />
          <span className="text-3xl font-semibold text-white">AInvoker</span>
          <span className="text-3xl font-light text-[#888]">Admin</span>
        </div>
        <h2 className="w-fit bg-accent-gradient-lg bg-clip-text text-3xl leading-[1.3] font-black text-transparent lg:text-4xl">
          The control room behind every workspace
        </h2>
        <p className="text-lg text-[#cccccc]">
          Keep the model catalog accurate, help customers, and stop abuse fast.
        </p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#2a2a2a] pt-6">
          {sectionGroups.flatMap((group) =>
            group.sections.map(({ path, label, icon: Icon, live }) => (
              <li key={path} className="flex items-center gap-2.5 text-sm text-[#aaa]">
                <Icon className="size-4 shrink-0 text-[#777]" aria-hidden />
                <span className={live ? 'text-white' : ''}>{label}</span>
              </li>
            )),
          )}
        </ul>
      </div>
    </div>
  );
}
