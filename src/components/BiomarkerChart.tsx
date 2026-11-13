import React, { useState, useMemo } from 'react';
import type { BiomarkerReading } from '../types';

interface BiomarkerChartProps {
  points: BiomarkerReading[];
  minRef: number;
  maxRef: number;
  unit: string;
}

function formatShortDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function buildSmoothPath(coords: Array<{ x: number; y: number }>): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  if (coords.length === 2) {
    return `M ${coords[0].x} ${coords[0].y} C ${(coords[0].x + coords[1].x) / 2} ${coords[0].y}, ${(coords[0].x + coords[1].x) / 2} ${coords[1].y}, ${coords[1].x} ${coords[1].y}`;
  }

  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export const BiomarkerChart: React.FC<BiomarkerChartProps> = ({
  points,
  minRef,
  maxRef,
  unit,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 760;
  const height = 280;
  const padLeft = 28;
  const padRight = 28;
  const padTop = 32;
  const padBottom = 42;

  const { coords, bandTop, bandBottom, pathD } = useMemo(() => {
    const allVals = [...points.map((p) => p.value), minRef, maxRef];
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const span = Math.max(rawMax - rawMin, 1);
    const yMin = rawMin - span * 0.18;
    const yMax = rawMax + span * 0.18;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const toY = (v: number) =>
      padTop + ((yMax - v) / (yMax - yMin)) * plotH;

    const mapped = points.map((p, idx) => {
      const x =
        points.length === 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (points.length - 1)) * plotW;
      const y = toY(p.value);
      return { x, y, point: p };
    });

    const bTop = toY(maxRef);
    const bBot = toY(minRef);

    return {
      coords: mapped,
      bandTop: Math.min(bTop, bBot),
      bandBottom: Math.max(bTop, bBot),
      pathD: buildSmoothPath(mapped),
    };
  }, [points, minRef, maxRef]);

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : null;

  return (
    <div className="relative w-full select-none">
      {/* Subtle legend for Normal Reference Range band */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span
            className="inline-block w-3.5 h-2.5 rounded-sm bg-emerald-500/15"
            aria-hidden="true"
          />
          <span>
            Normal Reference Range ({minRef}–{maxRef} {unit})
          </span>
        </div>
        <span className="text-xs text-gray-400">Hover points for details</span>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Biomarker historical trend chart"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Normal Reference Range horizontal band (light green) */}
          <rect
            x={padLeft}
            y={bandTop}
            width={width - padLeft - padRight}
            height={Math.max(bandBottom - bandTop, 4)}
            rx={6}
            fill="#10B981"
            fillOpacity={0.11}
          />

          {/* Subtle horizontal dashed bounds for reference band */}
          <line
            x1={padLeft}
            x2={width - padRight}
            y1={bandTop}
            y2={bandTop}
            stroke="#10B981"
            strokeOpacity={0.28}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <line
            x1={padLeft}
            x2={width - padRight}
            y1={bandBottom}
            y2={bandBottom}
            stroke="#10B981"
            strokeOpacity={0.28}
            strokeDasharray="4 4"
            strokeWidth={1}
          />

          {/* NO vertical grid lines and NO Y-axis labels */}

          {/* Hover vertical hairline (only on hover) */}
          {activePoint && (
            <line
              x1={activePoint.x}
              x2={activePoint.x}
              y1={padTop - 8}
              y2={height - padBottom}
              stroke="#D1D5DB"
              strokeWidth={1}
            />
          )}

          {/* Smooth trend line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#065F46"
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X-axis dates (minimal) */}
          {coords.map((c, idx) => (
            <text
              key={`date-${c.point.id}`}
              x={c.x}
              y={height - 12}
              textAnchor="middle"
              className="fill-gray-400 text-[11px]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {formatShortDate(c.point.date)}
            </text>
          ))}

          {/* Interactive nodes + generous invisible hit targets */}
          {coords.map((c, idx) => {
            const isHovered = hoveredIdx === idx;
            const isOutOfBounds = c.point.status !== 'normal';
            const fillColor = isOutOfBounds ? '#EF4444' : '#10B981';

            return (
              <g key={c.point.id}>
                {isHovered && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={11}
                    fill={fillColor}
                    fillOpacity={0.16}
                  />
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#FFFFFF"
                  stroke={fillColor}
                  strokeWidth={2.5}
                  className="transition-all duration-150"
                />
                {/* Large hit target */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={22}
                  fill="transparent"
                  className="cursor-pointer"
                  tabIndex={0}
                  aria-label={`${c.point.name} ${c.point.value} ${c.point.unit} on ${c.point.date}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onFocus={() => setHoveredIdx(idx)}
                  onBlur={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full bg-white rounded-2xl px-4 py-3 shadow-md ring-1 ring-gray-100 min-w-[164px]"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${Math.max((activePoint.y / height) * 100 - 4, 8)}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                {formatShortDate(activePoint.point.date)}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activePoint.point.status === 'normal'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {activePoint.point.status === 'normal'
                  ? 'Normal'
                  : activePoint.point.status === 'high'
                  ? 'High'
                  : 'Low'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono-nums text-lg font-semibold text-gray-900">
                {activePoint.point.value}
              </span>
              <span className="text-xs text-gray-500">{activePoint.point.unit}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-gray-400">
              Ref: {minRef}–{maxRef} {unit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
