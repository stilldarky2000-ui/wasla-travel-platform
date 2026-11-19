import { useEffect } from 'react';

export function useScrollReveal(dependencyKey?: string) {
  useEffect(() => {
    const revealElement = (el: HTMLElement) => {
      el.classList.add('is-revealed');
      el.setAttribute('data-wasla-revealed', '1');
    };

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-item'));
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      elements.forEach(revealElement);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '80px 0px 80px 0px' }
    );

    elements.forEach((el) => {
      if (
        el.getAttribute('data-wasla-revealed') === '1' ||
        el.classList.contains('is-revealed') ||
        el.closest('.carousel-track')
      ) {
        revealElement(el);
      } else {
        observer.observe(el);
      }
    });

    // Safety fallback for mobile viewports and horizontal carousels so items never stay hidden
    const fallbackTimer = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal-item').forEach(revealElement);
    }, 250);

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [dependencyKey]);
}
