import React from 'react';
import { HiChevronDown } from 'react-icons/hi2';
import { controlBorder, controlClass } from './Field';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  ref?: React.Ref<HTMLSelectElement>;
};

export const Select: React.FC<SelectProps> = ({ error, className = '', children, ...props }) => (
  <div className={`relative ${className}`}>
    <select
      className={`${controlClass} ${controlBorder(error)} appearance-none pr-8 cursor-pointer`}
      {...props}
    >
      {children}
    </select>
    <HiChevronDown
      aria-hidden
      className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400"
    />
  </div>
);
