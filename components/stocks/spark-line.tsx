"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  className?: string;
}

export function SparkLine({
  data,
  width = 80,
  height = 24,
  positive,
  className,
}: SparkLineProps) {
  const id = useId();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 1;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((value - min) / range) * innerHeight;
    return `${x},${y}`;
  });

  const isUp = positive ?? data[data.length - 1] >= data[0];
  const strokeColor = isUp ? "oklch(72% 0.19 155)" : "oklch(60% 0.22 25)";

  const gradId = `spark-${id}`;

  // Create area fill path
  const areaPoints = [
    `${padding},${padding + innerHeight}`,
    ...points,
    `${padding + innerWidth},${padding + innerHeight}`,
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints.join(" ")}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
