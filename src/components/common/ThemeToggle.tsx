import { HiOutlineComputerDesktop, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2';
import { useTheme, type ThemePreference } from '../../contexts/ThemeContext';

const themeOptions: { value: ThemePreference; label: string; icon: typeof HiOutlineSun }[] = [
  { value: 'DEVICE', label: 'Device', icon: HiOutlineComputerDesktop },
  { value: 'LIGHT', label: 'Light', icon: HiOutlineSun },
  { value: 'DARK', label: 'Dark', icon: HiOutlineMoon },
];

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { themePreference, setThemePreference } = useTheme();

  return (
    <div
      className={`inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
      role="group"
      aria-label="Theme preference"
    >
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const selected = themePreference === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={selected}
            title={label}
            onClick={() => setThemePreference(value)}
            className={[
              'grid size-8 place-content-center rounded-md transition-colors',
              selected
                ? 'bg-white text-accent shadow-sm dark:bg-neutral-950 dark:text-neutral-100'
                : 'text-neutral-400 hover:text-accent dark:hover:text-neutral-100',
            ].join(' ')}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
