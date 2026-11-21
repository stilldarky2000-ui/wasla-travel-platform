import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import fallbackCoastImg from '../assets/images/hero_red_sea_coast_1794609167890.jpg';
import { resolveBundledMediaUrl } from '../data/marketplaceData';

interface SmartImageProps {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  placeholderLabel?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  loading = 'eager',
  sizes,
  placeholderLabel,
}) => {
  const safeFallback =
    fallbackSrc && fallbackSrc.trim().length > 0
      ? resolveBundledMediaUrl(fallbackSrc)
      : fallbackCoastImg;
  const resolvedPrimary =
    src && src.trim().length > 0 ? resolveBundledMediaUrl(src) : safeFallback;

  const [usedFallback, setUsedFallback] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const activeSrc = usedFallback ? safeFallback : resolvedPrimary;

  useEffect(() => {
    setUsedFallback(false);
    setErrored(false);
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [resolvedPrimary]);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    // Fail-safe so horizontal carousel or cached images never stay hidden at opacity-0
    const timer = window.setTimeout(() => {
      setLoaded(true);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [activeSrc]);

  const handleImgRef = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setLoaded(true);
      setErrored(false);
    }
  }, []);

  const handleError = () => {
    if (!usedFallback && activeSrc !== safeFallback) {
      setUsedFallback(true);
      setErrored(false);
      return;
    }
    setErrored(true);
  };

  return (
    <div className={`wasla-img-glare relative overflow-hidden bg-[#FFF7ED] ${className}`}>
      {!loaded && !errored && (
        <div
          aria-hidden="true"
          className="shimmer-wave pointer-events-none absolute inset-0 bg-[#FFF7ED]"
        />
      )}
      {errored ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#FFEDD5] to-[#FFF7ED] p-4 text-center text-[#475569]">
          <ImageOff className="h-5 w-5 text-[#EE5426]" aria-hidden="true" />
          {placeholderLabel && <span className="text-xs font-medium">{placeholderLabel}</span>}
        </div>
      ) : (
        <img
          ref={handleImgRef}
          src={activeSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          referrerPolicy="no-referrer"
          onLoad={() => {
            setLoaded(true);
            setErrored(false);
          }}
          onError={handleError}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-300 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
