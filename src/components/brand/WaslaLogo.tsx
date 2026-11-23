import React from 'react';

export interface WaslaLogoProps {
  variant?: 'full' | 'english' | 'arabic' | 'icon' | 'avatar' | 'mark';
  iconStyle?: 'orange' | 'navy';
  theme?: 'auto' | 'light' | 'dark';
  withCardBg?: boolean;
  className?: string;
}

export const WaslaLogo: React.FC<WaslaLogoProps> = ({
  variant = 'full',
  iconStyle = 'orange',
  theme = 'auto',
  withCardBg = false,
  className = 'h-11 w-auto',
}) => {
  if (variant === 'icon' || variant === 'avatar') {
    const isOrange = iconStyle === 'orange';
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 128 128"
        width="128"
        height="128"
        fill="none"
        role="img"
        aria-label="Wasla Travel Icon"
        direction="ltr"
        {...({ dir: 'ltr' } as Record<string, string>)}
        className={className}
      >
        {variant === 'avatar' ? (
          <circle cx="64" cy="64" r="64" fill={isOrange ? '#EE5426' : '#0F2233'} />
        ) : (
          <rect width="128" height="128" rx="28" fill={isOrange ? '#EE5426' : '#0F2233'} />
        )}
        {/*
         * Vertically & horizontally centered W knot inside 128x128:
         * Local path y: 12..66 (midpoint y = 39), x: 10..90 (midpoint x = 50).
         * translate(14, 25) -> global x: 24..104 (center 64.0), global y: 37..91 (center 64.0).
         */}
        {isOrange ? (
          <g
            transform="translate(14, 25)"
            stroke="#FAF4ED"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12 L33 66 L56 12" />
            <path d="M44 12 L67 66 L90 12" />
          </g>
        ) : (
          <g
            transform="translate(14, 25)"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12 L33 66 L56 12" stroke="#FAF4ED" strokeWidth="12" />
            <path d="M44 12 L67 66 L90 12" stroke="#EE5426" strokeWidth="12" />
          </g>
        )}
      </svg>
    );
  }

  const primaryStroke =
    theme === 'dark'
      ? 'stroke-white'
      : theme === 'light'
      ? 'stroke-[#0F2233]'
      : 'stroke-[#0F2233] dark:stroke-white';

  const primaryFill =
    theme === 'dark'
      ? 'fill-white'
      : theme === 'light'
      ? 'fill-[#0F2233]'
      : 'fill-[#0F2233] dark:fill-white';

  const dividerStroke =
    theme === 'dark'
      ? 'stroke-[#334155]'
      : theme === 'light'
      ? 'stroke-[#C8C2B8]'
      : 'stroke-[#C8C2B8] dark:stroke-[#334155]';

  const cardFill =
    theme === 'dark'
      ? 'fill-[#0F2233]'
      : theme === 'light'
      ? 'fill-[#FAF4ED]'
      : 'fill-[#FAF4ED] dark:fill-[#0F2233]';

  if (variant === 'mark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 78"
        width="100"
        height="78"
        fill="none"
        role="img"
        aria-label="Wasla Travel Mark"
        direction="ltr"
        {...({ dir: 'ltr' } as Record<string, string>)}
        className={className}
      >
        {/* Centered inside 100x78: x 10..90 (center 50), y 12..66 (center 39) */}
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 12 L33 66 L56 12" className={primaryStroke} strokeWidth="12" />
          <path d="M44 12 L67 66 L90 12" stroke="#EE5426" strokeWidth="12" />
        </g>
      </svg>
    );
  }

  if (variant === 'english' || variant === 'arabic') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 330 130"
        width="330"
        height="130"
        fill="none"
        role="img"
        aria-label="Wasla Travel"
        direction="ltr"
        {...({ dir: 'ltr' } as Record<string, string>)}
        className={className}
      >
        {withCardBg && <rect width="330" height="130" rx="16" className={cardFill} />}
        {/*
         * Vertically centered W knot inside 130px height:
         * translate(24, 26) + local y 12..66 -> global y 38..92 (exact vertical center = 65.0).
         */}
        <g transform="translate(24, 26)" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 12 L33 66 L56 12" className={primaryStroke} strokeWidth="12" />
          <path d="M44 12 L67 66 L90 12" stroke="#EE5426" strokeWidth="12" />
        </g>
        {variant === 'english' ? (
          <>
            <text
              x="144"
              y="66"
              fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
              fontSize="44"
              fontWeight="800"
              letterSpacing="-0.5"
              className={primaryFill}
            >
              Wasla
            </text>
            <text
              x="144"
              y="96"
              fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
              fontSize="20"
              fontWeight="800"
              textLength="127.05"
              lengthAdjust="spacing"
              fill="#EE5426"
            >
              TRAVEL
            </text>
          </>
        ) : (
          <>
            <text
              x="225"
              y="64"
              textAnchor="middle"
              direction="rtl"
              fontFamily="'Cairo', sans-serif"
              fontSize="45"
              fontWeight="800"
              className={primaryFill}
            >
              وصلة
            </text>
            <text
              x="225"
              y="97"
              textAnchor="middle"
              direction="rtl"
              fontFamily="'Cairo', sans-serif"
              fontSize="24"
              fontWeight="600"
              textLength="106"
              lengthAdjust="spacingAndGlyphs"
              fill="#EE5426"
            >
              ترافيل
            </text>
          </>
        )}
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 130"
      width="540"
      height="130"
      fill="none"
      role="img"
      aria-label="Wasla Travel | وصلة ترافيل"
      direction="ltr"
      {...({ dir: 'ltr' } as Record<string, string>)}
      className={className}
    >
      {withCardBg && <rect width="540" height="130" rx="16" className={cardFill} />}
      {/*
       * Vertically centered W knot inside 540x130:
       * translate(28, 26) + local y 12..66 -> global y 38..92 (exact vertical center = 65.0).
       * Unified text baselines: top row y="66", bottom row y="96", divider y1="29" y2="101" (center 65.0).
       */}
      <g transform="translate(28, 26)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 12 L33 66 L56 12" className={primaryStroke} strokeWidth="12" />
        <path d="M44 12 L67 66 L90 12" stroke="#EE5426" strokeWidth="12" />
      </g>
      <text
        x="148"
        y="66"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="44"
        fontWeight="800"
        letterSpacing="-0.5"
        className={primaryFill}
      >
        Wasla
      </text>
      <text
        x="148"
        y="96"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="20"
        fontWeight="800"
        textLength="127.05"
        lengthAdjust="spacing"
        fill="#EE5426"
      >
        TRAVEL
      </text>
      <line
        x1="322"
        y1="29"
        x2="322"
        y2="101"
        strokeWidth="2"
        strokeLinecap="round"
        className={dividerStroke}
      />
      <text
        x="424"
        y="64"
        textAnchor="middle"
        direction="rtl"
        fontFamily="'Cairo', sans-serif"
        fontSize="45"
        fontWeight="800"
        className={primaryFill}
      >
        وصلة
      </text>
      <text
        x="424"
        y="97"
        textAnchor="middle"
        direction="rtl"
        fontFamily="'Cairo', sans-serif"
        fontSize="24"
        fontWeight="600"
        textLength="106"
        lengthAdjust="spacingAndGlyphs"
        fill="#EE5426"
      >
        ترافيل
      </text>
    </svg>
  );
};

export default WaslaLogo;
