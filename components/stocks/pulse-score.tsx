"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PulseScore as PulseScoreType, PulseDimension } from "@/lib/pulse-score";
import { gradeColor } from "@/lib/pulse-score";

interface PulseScoreProps {
  score: PulseScoreType;
  compact?: boolean;
}

// ── Radar Chart (pure SVG) ────────────────────────────────────
function RadarChart({ dimensions }: { dimensions: PulseDimension[] }) {
  const cx = 100;
  const cy = 100;
  const maxR = 80;
  const levels = 4;
  const count = dimensions.length;
  const angleStep = (2 * Math.PI) / count;
  const startAngle = -Math.PI / 2; // start from top

  // Grid lines
  const gridPaths = Array.from({ length: levels }, (_, i) => {
    const r = (maxR / levels) * (i + 1);
    const points = Array.from({ length: count }, (_, j) => {
      const angle = startAngle + j * angleStep;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    return points.join(" ");
  });

  // Axis lines
  const axes = Array.from({ length: count }, (_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      x2: cx + maxR * Math.cos(angle),
      y2: cy + maxR * Math.sin(angle),
    };
  });

  // Data polygon
  const dataPoints = dimensions.map((d, i) => {
    const r = (d.score / 20) * maxR;
    const angle = startAngle + i * angleStep;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  // Labels
  const labels = dimensions.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const labelR = maxR + 18;
    return {
      x: cx + labelR * Math.cos(angle),
      y: cy + labelR * Math.sin(angle),
      name: d.name,
      score: d.score,
    };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px] aspect-square">
      {/* Grid */}
      {gridPaths.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
          opacity={0.5}
        />
      ))}

      {/* Axes */}
      {axes.map((axis, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={axis.x2}
          y2={axis.y2}
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-border"
          opacity={0.3}
        />
      ))}

      {/* Data area */}
      <polygon
        points={dataPoints.join(" ")}
        fill="oklch(58% 0.21 265 / 0.15)"
        stroke="oklch(58% 0.21 265)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {dataPoints.map((point, i) => {
        const [x, y] = point.split(",").map(Number);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill="oklch(58% 0.21 265)"
          />
        );
      })}

      {/* Labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground text-[7px] font-medium"
        >
          {label.name}
        </text>
      ))}
    </svg>
  );
}

// ── Dimension Bar ─────────────────────────────────────────────
function DimensionBar({
  dimension,
  expanded,
  onToggle,
}: {
  dimension: PulseDimension;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = (dimension.score / 20) * 100;
  const color =
    pct >= 70 ? "bg-positive" : pct >= 50 ? "bg-brand" : pct >= 30 ? "bg-warning" : "bg-negative";

  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center gap-3 group">
        <span className="text-xs font-medium text-muted-foreground w-20 text-left shrink-0">
          {dimension.name}
        </span>
        <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-foreground w-10 text-right">
          {dimension.score}/20
        </span>
        {expanded ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Factor breakdown */}
      {expanded && (
        <div className="mt-2 ml-[calc(5rem+0.75rem)] space-y-1.5 pb-2 animate-fade-in">
          {dimension.factors.map((factor) => (
            <div key={factor.name} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{factor.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-foreground">{factor.value}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`size-1.5 rounded-full ${
                        i < factor.score ? "bg-brand" : "bg-surface-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function PulseScoreCard({ score, compact }: PulseScoreProps) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold font-display ${gradeColor(score.grade)}`}>
          {score.grade}
        </span>
        <span className="text-xs text-muted-foreground font-mono">{score.total}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-1 border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Pulse Score</h3>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-display ${gradeColor(score.grade)}`}>
            {score.grade}
          </span>
          <span className="text-sm text-muted-foreground font-mono">{score.total}/100</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center">
        {/* Radar chart */}
        <div className="shrink-0">
          <RadarChart dimensions={score.dimensions} />
        </div>

        {/* Dimension bars */}
        <div className="flex-1 w-full space-y-3">
          {score.dimensions.map((dim) => (
            <DimensionBar
              key={dim.name}
              dimension={dim}
              expanded={expandedDim === dim.name}
              onToggle={() =>
                setExpandedDim(expandedDim === dim.name ? null : dim.name)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
