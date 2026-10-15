type SpinnerSize = 'sm' | 'md';

const sizeClass: Record<SpinnerSize, string> = {
  sm: 'size-3.5 border-[1.5px]',
  md: 'size-5 border-2',
};

export function Spinner({ size = 'md', className = '' }: { size?: SpinnerSize; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent ${sizeClass[size]} ${className}`}
    />
  );
}
