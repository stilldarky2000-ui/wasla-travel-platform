import React from 'react';
import waslaBrandEmblemImg from '../assets/images/wasla_brand_emblem_v2_1795116965418.jpg';

interface WaslaBrandMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<WaslaBrandMarkProps['size']>, string> = {
  xs: 'h-4 w-4 rounded-[22%]',
  sm: 'h-7 w-7 rounded-[22%]',
  md: 'h-8 w-8 rounded-[22%]',
  lg: 'h-10 w-10 sm:h-11 sm:w-11 rounded-[22%]',
};

export const WaslaBrandMark: React.FC<WaslaBrandMarkProps> = ({ size = 'sm', className = '' }) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#EA580C] shadow-[0_3px_12px_rgba(11,31,46,0.2)] ring-1 ring-black/10 ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    >
      <img
        src={waslaBrandEmblemImg}
        alt="Wasla Travel"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
      />
    </span>
  );
};
