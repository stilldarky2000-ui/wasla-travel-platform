import React from 'react';
import { WaslaLogo } from './brand/WaslaLogo';

interface WaslaBrandMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  iconStyle?: 'orange' | 'navy';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<WaslaBrandMarkProps['size']>, string> = {
  xs: 'h-4 w-4',
  sm: 'h-8 w-8 sm:h-9 sm:w-9',
  md: 'h-9 w-9 sm:h-10 sm:w-10',
  lg: 'h-10 w-10 sm:h-11 sm:w-11',
};

export const WaslaBrandMark: React.FC<WaslaBrandMarkProps> = ({
  size = 'sm',
  iconStyle = 'orange',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    >
      <WaslaLogo variant="avatar" iconStyle={iconStyle} className="h-full w-full" />
    </span>
  );
};
