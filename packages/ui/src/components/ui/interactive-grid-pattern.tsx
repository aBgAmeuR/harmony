'use client';

import { cn } from "../../lib/utils";
import React, { useState, useEffect } from "react";

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 *
 * @param width - The width of each square.
 * @param height - The height of each square.
 * @param squares - The number of squares in the grid. The first element is the number of horizontal squares, and the second element is the number of vertical squares.
 * @param className - The class name of the grid.
 * @param squaresClassName - The class name of the squares.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number]; // [horizontal, vertical]
  className?: string;
  squaresClassName?: string;
}

/**
 * The InteractiveGridPattern component.
 *
 * @see InteractiveGridPatternProps for the props interface.
 * @returns A React component.
 */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
  const [randomSquares, setRandomSquares] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const newRandomSquares = new Set<number>();
      for (let i = 0; i < 8; i++) {
        newRandomSquares.add(Math.floor(Math.random() * width * height));
      }
      setRandomSquares(newRandomSquares);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full border border-gray-400/20",
        className,
      )}
      {...props}
    >
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              "stroke-gray-400/20 transition-all duration-100 ease-in-out [&:not(:hover)]:duration-1000",
              hoveredSquare === index ? "fill-gray-300/30" : "fill-transparent",
              randomSquares.has(index) ? "fill-chart-1" : null,
              squaresClassName,
            )}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}
