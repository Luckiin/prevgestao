"use client";

import { useEffect, useRef } from "react";

/**
 * Hook que observa elementos com a classe `site-hidden` (ou variantes)
 * e adiciona `site-visible` quando eles entram no viewport.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("site-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    // Observa o próprio elemento e todos os filhos com site-hidden*
    const targets = [el, ...el.querySelectorAll("[class*='site-hidden']")];
    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return ref;
}
