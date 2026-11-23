import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';

interface HorizontalScrollTableFrameProps {
  children: React.ReactNode;
  isAr?: boolean;
  /** Disable keyboard ArrowLeft/ArrowRight when a modal is open on top */
  keyboardEnabled?: boolean;
  /** Optional accessible label for the scroll region */
  ariaLabel?: string;
  className?: string;
}

/**
 * Wraps wide data tables with:
 * - Always-visible sticky horizontal scrollbar + Left/Right arrow buttons
 *   (both top header strip and floating bottom dock that follows you anywhere vertically)
 * - Click-to-jump & smooth drag thumb on the synchronized scrollbar track
 * - Press-and-hold continuous scrolling on arrow buttons
 * - Keyboard ArrowLeft / ArrowRight navigation (auto-ignored while typing in inputs/modals)
 * - Full LTR & RTL visual-direction accuracy
 */
export const HorizontalScrollTableFrame: React.FC<HorizontalScrollTableFrameProps> = ({
  children,
  isAr = false,
  keyboardEnabled = true,
  ariaLabel,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const topTrackRef = useRef<HTMLDivElement | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startVisualRatio: number;
    trackWidth: number;
    thumbWidth: number;
  }>({
    active: false,
    startX: 0,
    startVisualRatio: 0,
    trackWidth: 1,
    thumbWidth: 40,
  });

  const [metrics, setMetrics] = useState({
    hasOverflow: false,
    visualRatio: 0, // 0 = leftmost visual edge, 1 = rightmost visual edge
    thumbPercent: 100,
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Compute normalized visual progress [0..1] from visual-left (0) to visual-right (1)
  // regardless of browser RTL scrollLeft sign convention.
  const readMetrics = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (maxScroll <= 2) {
      setMetrics((prev) =>
        prev.hasOverflow
          ? {
              hasOverflow: false,
              visualRatio: 0,
              thumbPercent: 100,
              canScrollLeft: false,
              canScrollRight: false,
            }
          : prev
      );
      return;
    }

    const dir = window.getComputedStyle(el).direction;
    let visualRatio = 0;
    if (dir === 'rtl') {
      // Chrome/Firefox/Safari modern standard: scrollLeft is 0 at rightmost edge, negative going left to -maxScroll
      if (el.scrollLeft <= 0) {
        visualRatio = 1 + el.scrollLeft / maxScroll;
      } else {
        // Fallback for positive-RTL engines
        visualRatio = el.scrollLeft / maxScroll;
      }
    } else {
      visualRatio = el.scrollLeft / maxScroll;
    }

    visualRatio = Math.max(0, Math.min(1, visualRatio));
    const thumbPercent = Math.max(12, Math.min(100, (el.clientWidth / el.scrollWidth) * 100));

    setMetrics({
      hasOverflow: true,
      visualRatio,
      thumbPercent,
      canScrollLeft: visualRatio > 0.005,
      canScrollRight: visualRatio < 0.995,
    });
  }, []);

  // Scroll to a normalized visual ratio [0..1] (0 = visual left, 1 = visual right)
  const scrollToVisualRatio = useCallback((ratio: number, behavior: ScrollBehavior = 'auto') => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (maxScroll <= 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const dir = window.getComputedStyle(el).direction;

    let targetLeft = clamped * maxScroll;
    if (dir === 'rtl') {
      // Negative RTL scrollLeft: 0 = rightmost (ratio 1), -maxScroll = leftmost (ratio 0)
      targetLeft = (clamped - 1) * maxScroll;
    }
    el.scrollTo({ left: targetLeft, behavior });
  }, []);

  // Step visually left (-1) or visually right (+1)
  const stepVisual = useCallback((direction: -1 | 1, amountPx = 280) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * amountPx, behavior: 'smooth' });
  }, []);

  // Stop press-and-hold scrolling
  const stopHoldScroll = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // Start press-and-hold continuous scrolling on arrow buttons
  const startHoldScroll = useCallback(
    (direction: -1 | 1) => {
      stopHoldScroll();
      stepVisual(direction, 260);
      holdTimerRef.current = window.setInterval(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * 90, behavior: 'auto' });
      }, 65);
    },
    [stepVisual, stopHoldScroll]
  );

  useEffect(() => {
    return () => stopHoldScroll();
  }, [stopHoldScroll]);

  // Observe container & table resize + initial measurement
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    readMetrics();

    const ro = new ResizeObserver(() => {
      readMetrics();
    });
    ro.observe(el);
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild);
    }

    const onResize = () => readMetrics();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [readMetrics, children]);

  // Keyboard ArrowLeft / ArrowRight navigation
  useEffect(() => {
    if (!keyboardEnabled || !metrics.hasOverflow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          active.isContentEditable
        ) {
          return;
        }
      }

      const el = scrollRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Only scroll if this table is actually visible on screen
      const isVisibleInViewport =
        rect.height > 0 && rect.bottom > 80 && rect.top < window.innerHeight - 40;
      if (!isVisibleInViewport) return;

      e.preventDefault();
      stepVisual(e.key === 'ArrowRight' ? 1 : -1, 240);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardEnabled, metrics.hasOverflow, stepVisual]);

  // Track click-to-jump and thumb drag handlers
  const handleTrackPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    refEl: HTMLDivElement | null
  ) => {
    if (!refEl) return;
    const rect = refEl.getBoundingClientRect();
    const thumbW = Math.max(36, (metrics.thumbPercent / 100) * rect.width);
    const usableW = Math.max(1, rect.width - thumbW);
    const clickX = e.clientX - rect.left;
    const targetRatio = Math.max(0, Math.min(1, (clickX - thumbW / 2) / usableW));
    scrollToVisualRatio(targetRatio, 'auto');

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startVisualRatio: targetRatio,
      trackWidth: rect.width,
      thumbWidth: thumbW,
    };

    const onMove = (moveEvent: PointerEvent) => {
      if (!dragStateRef.current.active) return;
      const dx = moveEvent.clientX - dragStateRef.current.startX;
      const dragUsable = Math.max(
        1,
        dragStateRef.current.trackWidth - dragStateRef.current.thumbWidth
      );
      const nextRatio = dragStateRef.current.startVisualRatio + dx / dragUsable;
      scrollToVisualRatio(nextRatio, 'auto');
    };

    const onUp = () => {
      dragStateRef.current.active = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const thumbLeftPercent = metrics.visualRatio * (100 - metrics.thumbPercent);
  const scrollPctLabel = Math.round(metrics.visualRatio * 100);

  const renderControlBar = (position: 'top' | 'bottom') => {
    if (!metrics.hasOverflow) return null;
    const refForBar = position === 'top' ? topTrackRef : trackRef;

    return (
      <div
        dir="ltr"
        className={
          position === 'top'
            ? 'sticky top-0 z-20 flex items-center gap-2 border-b border-[#CBD5E1] bg-[#F8FAFC]/95 backdrop-blur-xs px-3 py-2'
            : 'sticky bottom-2 z-20 mx-2 my-2 flex items-center gap-2 rounded-xl border-2 border-[#0F2233]/20 bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg'
        }
        aria-label={
          isAr ? 'شريط التمرير الأفقي للجدول' : 'Horizontal table scroll navigation'
        }
      >
        {/* Left Arrow Button (visually moves left) */}
        <button
          type="button"
          onPointerDown={() => startHoldScroll(-1)}
          onPointerUp={stopHoldScroll}
          onPointerLeave={stopHoldScroll}
          onPointerCancel={stopHoldScroll}
          disabled={!metrics.canScrollLeft}
          aria-label={isAr ? 'تحريك الجدول لليسار' : 'Scroll table left'}
          title={isAr ? 'يسار (سهم يسار في الكيبورد)' : 'Scroll Left (Left Arrow key)'}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#0F2233] hover:border-[#EE5426] hover:bg-[#FFF7ED] hover:text-[#EE5426] disabled:opacity-35 disabled:hover:bg-white disabled:hover:border-[#CBD5E1] disabled:hover:text-[#0F2233] cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Interactive Synchronized Scrollbar Track & Draggable Thumb */}
        <div
          ref={refForBar}
          onPointerDown={(e) => handleTrackPointerDown(e, refForBar.current)}
          role="slider"
          aria-label={isAr ? 'موضع التمرير الأفقي' : 'Horizontal scroll position'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={scrollPctLabel}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              stepVisual(-1, 240);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              stepVisual(1, 240);
            }
          }}
          className="relative h-3.5 flex-1 rounded-full bg-[#E2E8F0] border border-[#CBD5E1] cursor-pointer select-none touch-none overflow-hidden"
        >
          <div
            style={{
              width: `${metrics.thumbPercent}%`,
              left: `${thumbLeftPercent}%`,
            }}
            className="absolute top-0 bottom-0 rounded-full bg-[#0F2233] hover:bg-[#EE5426] active:bg-[#EE5426] transition-colors cursor-grab active:cursor-grabbing"
          />
        </div>

        {/* Right Arrow Button (visually moves right) */}
        <button
          type="button"
          onPointerDown={() => startHoldScroll(1)}
          onPointerUp={stopHoldScroll}
          onPointerLeave={stopHoldScroll}
          onPointerCancel={stopHoldScroll}
          disabled={!metrics.canScrollRight}
          aria-label={isAr ? 'تحريك الجدول لليمين' : 'Scroll table right'}
          title={isAr ? 'يمين (سهم يمين في الكيبورد)' : 'Scroll Right (Right Arrow key)'}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#0F2233] hover:border-[#EE5426] hover:bg-[#FFF7ED] hover:text-[#EE5426] disabled:opacity-35 disabled:hover:bg-white disabled:hover:border-[#CBD5E1] disabled:hover:text-[#0F2233] cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Keyboard Hint + Position % */}
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 text-[10.5px] font-bold text-[#475569] whitespace-nowrap shrink-0 tabular-nums"
        >
          <Keyboard className="h-3 w-3 text-[#EE5426]" aria-hidden="true" />
          <span>{isAr ? 'أسهم الكيبورد ← →' : 'Keys ← →'}</span>
          <span className="font-mono text-[#0F2233]">{scrollPctLabel}%</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative rounded-xl border border-[#CBD5E1] bg-white shadow-xs overflow-x-clip ${className}`}
    >
      {/* Top Sticky Interactive Horizontal Scroll Bar */}
      {renderControlBar('top')}

      {/* Table Scroll Container with Subtle Left/Right Overflow Shadows */}
      <div className="relative">
        {metrics.hasOverflow && metrics.canScrollLeft && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-[#0F2233]/12 to-transparent"
          />
        )}
        {metrics.hasOverflow && metrics.canScrollRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-[#0F2233]/12 to-transparent"
          />
        )}

        <div
          ref={scrollRef}
          onScroll={readMetrics}
          aria-label={ariaLabel}
          className="overflow-x-auto focus:outline-none"
        >
          {children}
        </div>
      </div>

      {/* Floating Sticky Bottom Dock, stays right in front of you wherever you scroll vertically */}
      {renderControlBar('bottom')}
    </div>
  );
};
