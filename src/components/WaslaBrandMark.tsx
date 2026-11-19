import React from 'react';

interface WaslaBrandMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<WaslaBrandMarkProps['size']>, string> = {
  xs: 'h-4 w-4 rounded-[24%]',
  sm: 'h-7 w-7 rounded-[22%]',
  md: 'h-8 w-8 rounded-[22%]',
  lg: 'h-9 w-9 sm:h-11 sm:w-11 rounded-[22%]',
};

export const WaslaBrandMark: React.FC<WaslaBrandMarkProps> = ({ size = 'sm', className = '' }) => {
  return (
    <span
      className={`wasla-img-glare inline-flex shrink-0 items-center justify-center overflow-hidden shadow-[0_3px_10px_rgba(234,88,12,0.28)] ring-1 ring-[#EA580C]/20 ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    >
      <img
        src="/assets/aistudio/wasla-brand-icon-1024x1024_c9251908.png"
        alt="Wasla Travel"
        className="h-full w-full object-cover scale-[1.18]"
      />
    </span>
  );
};
