"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { getRevealVariant, type RevealVariant } from "@/lib/reveal-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  variant?: RevealVariant;
}

export function Reveal({
  children,
  className,
  delay = 0,
  variant: explicitVariant,
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const variant = getRevealVariant(explicitVariant);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [variant, threshold]);

  return (
    <div
      className={cn(
        "reveal",
        variant && `reveal-${variant}`,
        visible && "reveal-visible",
        className
      )}
      ref={ref}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
