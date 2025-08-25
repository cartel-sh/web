"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface InfiniteScrollProps {
  children: React.ReactNode[];
  direction?: "left" | "right";
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

export function InfiniteScroll({
  children,
  direction = "left",
  speed = 30,
  className,
  pauseOnHover = true,
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const positionsRef = useRef<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [minHeight, setMinHeight] = useState<number>(100);

  const duplicatedChildren = [...children, ...children];

  const repositionItems = useCallback(() => {
    if (!containerRef.current || !scrollRef.current) return;
    
    const gap = 24;
    let currentX = 0;
    let maxHeight = 0;
    
    positionsRef.current = [];
    
    // Position all items sequentially and find max height
    itemsRef.current.forEach((item, index) => {
      if (item) {
        positionsRef.current[index] = currentX;
        item.style.transform = `translateX(${currentX}px)`;
        currentX += item.offsetWidth + gap;
        maxHeight = Math.max(maxHeight, item.offsetHeight);
      }
    });
    
    // Update minimum height based on tallest element
    if (maxHeight > 0) {
      setMinHeight(maxHeight);
    }
    
    setIsInitialized(true);
  }, []);

  // Set up resize observer for all items
  useEffect(() => {
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        // Debounce repositioning to avoid too many updates
        let hasChanges = false;
        entries.forEach((entry) => {
          if (entry.contentRect.width > 0) {
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          repositionItems();
        }
      });
    }

    // Observe all items
    itemsRef.current.forEach((item) => {
      if (item && resizeObserverRef.current) {
        resizeObserverRef.current.observe(item);
      }
    });

    // Initial positioning after a small delay to ensure content is loaded
    const timer = setTimeout(repositionItems, 100);

    return () => {
      clearTimeout(timer);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [duplicatedChildren.length, repositionItems]);

  // Handle animation
  useEffect(() => {
    if (!containerRef.current || !scrollRef.current || !isInitialized) return;

    let animationId: number;
    const containerWidth = containerRef.current.offsetWidth;
    const gap = 24;

    const animate = () => {
      if (!isPaused && itemsRef.current.length > 0) {
        let needsReposition = false;
        
        itemsRef.current.forEach((item, index) => {
          if (!item) return;
          
          let currentPos = positionsRef.current[index] || 0;
          
          if (direction === "left") {
            currentPos -= speed / 60;
            
            // Check if item has completely left the viewport on the left
            if (currentPos < -item.offsetWidth - gap) {
              needsReposition = true;
              // Find the rightmost position
              let maxX = -Infinity;
              itemsRef.current.forEach((otherItem, otherIndex) => {
                if (otherItem && otherIndex !== index) {
                  const otherPos = positionsRef.current[otherIndex] || 0;
                  maxX = Math.max(maxX, otherPos + otherItem.offsetWidth);
                }
              });
              currentPos = maxX + gap;
            }
          } else {
            currentPos += speed / 60;
            
            // Check if item has completely left the viewport on the right
            if (currentPos > containerWidth + gap) {
              needsReposition = true;
              // Find the leftmost position
              let minX = Infinity;
              itemsRef.current.forEach((otherItem, otherIndex) => {
                if (otherItem && otherIndex !== index) {
                  const otherPos = positionsRef.current[otherIndex] || 0;
                  minX = Math.min(minX, otherPos);
                }
              });
              currentPos = minX - item.offsetWidth - gap;
            }
          }
          
          positionsRef.current[index] = currentPos;
          item.style.transform = `translateX(${currentPos}px)`;
        });
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, direction, speed, isInitialized]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-x-auto overflow-y-visible", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={scrollRef}
        className="relative"
        style={{ minHeight: `${minHeight + 20}px` }}
      >
        {duplicatedChildren.map((child, index) => (
          <div 
            key={index} 
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            className="absolute top-0 left-0"
            style={{ 
              willChange: "transform",
              opacity: isInitialized ? 1 : 0,
              transition: "opacity 0.3s ease-in-out"
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}