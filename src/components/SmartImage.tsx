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
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const loadedSrcRef = useRef<string | null>(null);
  loadedSrcRef.current = loadedSrc;

  const activeSrc = usedFallback ? safeFallback : resolvedPrimary;
  const isCurrentLoaded = loadedSrc === activeSrc;
  const backdropSrc =
    loadedSrc && loadedSrc !== activeSrc ? loadedSrc : previousSrc;

  const markLoaded = useCallback((targetSrc: string) => {
    if (loadedSrcRef.current === targetSrc) {
      setErrored(false);
      return;
    }
    const prev = loadedSrcRef.current;
    if (prev && prev !== targetSrc) {
      setPreviousSrc(prev);
    }
    loadedSrcRef.current = targetSrc;
    setLoadedSrc(targetSrc);
    setErrored(false);
  }, []);

  useEffect(() => {
    setUsedFallback(false);
    setErrored(false);
  }, [resolvedPrimary]);

  useEffect(() => {
    if (!previousSrc) return;
    const timer = window.setTimeout(() => {
      setPreviousSrc(null);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [previousSrc]);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      if (!loadedSrcRef.current) {
        markLoaded(activeSrc);
        return;
      }
      const rafId = window.requestAnimationFrame(() => {
        markLoaded(activeSrc);
      });
      return () => window.cancelAnimationFrame(rafId);
    }
    if (loadedSrcRef.current) return;
    // Fail-safe on initial load so horizontal carousel or cached images never stay hidden at opacity-0
    const timer = window.setTimeout(() => {
      markLoaded(activeSrc);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [activeSrc, markLoaded]);

  const handleImgRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      if (node && node.complete && node.naturalWidth > 0 && !loadedSrcRef.current) {
        markLoaded(activeSrc);
      }
    },
    [activeSrc, markLoaded]
  );

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
      {!isCurrentLoaded && !backdropSrc && !errored && (
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
        <>
          {backdropSrc && (
            <img
              src={backdropSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              referrerPolicy="no-referrer"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          )}
          <img
            key={activeSrc}
            ref={handleImgRef}
            src={activeSrc}
            alt={alt}
            loading={loading}
            decoding="async"
            sizes={sizes}
            referrerPolicy="no-referrer"
            onLoad={() => markLoaded(activeSrc)}
            onError={handleError}
            className={`relative h-full w-full object-cover transition-[opacity,transform] duration-200 ease-out ${
              isCurrentLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}
    </div>
  );
};
