"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface AutoScrollProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function AutoScroll({
  children,
  direction = "horizontal",
  speed = 35,
  className,
  pauseOnHover = false,
}: AutoScrollProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const updateWidths = () => {
      if (direction === "horizontal") {
        setContainerWidth(containerRef.current?.offsetWidth || 0);
        setContentWidth(contentRef.current?.scrollWidth || 0);
      } else {
        setContainerWidth(containerRef.current?.offsetHeight || 0);
        setContentWidth(contentRef.current?.scrollHeight || 0);
      }
    };

    updateWidths();

    // Update measurements on window resize
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, [children, direction]);

  // Only animate if content is larger than container
  const shouldScroll = contentWidth > containerWidth;

  // Calculate animation duration based on content size and speed
  const duration = shouldScroll ? contentWidth / speed : 0;

  const isHorizontal = direction === "horizontal";

  const animationProps = isHorizontal
    ? {
        x: shouldScroll ? [0, -contentWidth / 2] : 0,
        transition: {
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop" as const,
            duration: duration,
            ease: "linear",
          },
        },
      }
    : {
        y: shouldScroll ? [0, -contentWidth / 2] : 0,
        transition: {
          y: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop" as const,
            duration: duration,
            ease: "linear",
          },
        },
      };

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden relative",
        isHorizontal ? "w-full" : "h-full",
        className
      )}
      onMouseEnter={() => pauseOnHover && setShouldAnimate(false)}
      onMouseLeave={() => setShouldAnimate(true)}
    >
      <motion.div
        ref={contentRef}
        className={cn("flex", isHorizontal ? "flex-row" : "flex-col")}
        animate={shouldAnimate ? animationProps : {}}
      >
        <div className={cn("flex", isHorizontal ? "flex-row" : "flex-col")}>
          {children}
        </div>
        {shouldScroll && (
          <div className={cn("flex", isHorizontal ? "flex-row" : "flex-col")}>
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}
