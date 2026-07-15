import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SalesChartProps } from './model';
import { formatCompactCurrency } from '../../../shared/format';

import './styles.scss';

const VB_H = 220;
const PAD = { top: 30, right: 16, bottom: 26, left: 8 };
const DEFAULT_WIDTH = 720;

function niceCeil(value: number): number {
    if (value <= 0) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const normalized = value / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * magnitude;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const plotRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(DEFAULT_WIDTH);

    useEffect(() => {
        const el = plotRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width;
            if (w && w > 0) setWidth(w);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { points, maxVal, plotTop, baselineY } = useMemo(() => {
        const plotTop = PAD.top;
        const plotBottom = VB_H - PAD.bottom;
        const plotW = width - PAD.left - PAD.right;
        const plotH = plotBottom - plotTop;
        const max = niceCeil(Math.max(...data.map(d => d.value), 0));
        const step = data.length > 1 ? plotW / (data.length - 1) : 0;
        const points = data.map((d, i) => ({
            ...d,
            x: PAD.left + (data.length > 1 ? i * step : plotW / 2),
            y: max > 0 ? plotBottom - (d.value / max) * plotH : plotBottom,
        }));
        return { points, maxVal: max, plotTop, baselineY: plotBottom };
    }, [data, width]);

    const hasRevenue = data.some(d => d.value > 0);
    const linePath = points.map(p => `${p.x},${p.y}`).join(' L ');
    const areaPath = points.length
        ? `M ${points[0].x},${baselineY} L ${linePath} L ${points[points.length - 1].x},${baselineY} Z`
        : '';

    const gridTicks = [0, maxVal / 2, maxVal];

    const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
        if (!hasRevenue || points.length === 0) return;
        const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
        const xVb = e.clientX - rect.left;
        let nearest = 0;
        let nearestDist = Infinity;
        points.forEach((p, i) => {
            const dist = Math.abs(p.x - xVb);
            if (dist < nearestDist) { nearestDist = dist; nearest = i; }
        });
        setHoverIndex(nearest);
    };

    const active = hoverIndex != null ? points[hoverIndex] : null;

    return (
        <div className="sales-chart">
            <div className="sales-chart-header">
                <div>
                    <h2>Revenue</h2>
                    <p className="sales-chart-subtitle">Invoiced total by month, last {data.length} months</p>
                </div>
                {hasRevenue && (
                    <div className="sales-chart-headline">
                        {formatCompactCurrency(points[points.length - 1]?.value)}
                        <span className="sales-chart-headline-label">this month</span>
                    </div>
                )}
            </div>

            <div className="sales-chart-plot" ref={plotRef}>
                <svg viewBox={`0 0 ${width} ${VB_H}`} className="sales-chart-svg">
                    <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2a78d6" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#2a78d6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {gridTicks.map((tick, i) => {
                        const y = maxVal > 0 ? baselineY - (tick / maxVal) * (baselineY - plotTop) : baselineY;
                        return (
                            <g key={i}>
                                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} className="sales-chart-gridline" />
                                <text x={PAD.left} y={y - 5} className="sales-chart-tick-label">{formatCompactCurrency(tick)}</text>
                            </g>
                        );
                    })}

                    {hasRevenue && (
                        <>
                            <path d={areaPath} fill="url(#salesFill)" />
                            <path d={`M ${linePath}`} className="sales-chart-line" />
                        </>
                    )}

                    {hoverIndex != null && (
                        <line
                            x1={points[hoverIndex].x} x2={points[hoverIndex].x}
                            y1={plotTop} y2={baselineY}
                            className="sales-chart-crosshair"
                        />
                    )}

                    {points.map((p, i) => (
                        <circle
                            key={p.key}
                            cx={p.x} cy={p.y}
                            r={hoverIndex === i || (hoverIndex == null && i === points.length - 1) ? 6 : 4}
                            className="sales-chart-dot"
                            opacity={hasRevenue ? 1 : 0}
                        />
                    ))}

                    {hasRevenue && (
                        <text
                            x={points[points.length - 1].x} y={points[points.length - 1].y - 12}
                            className="sales-chart-end-label"
                            textAnchor="end"
                        >
                            {formatCompactCurrency(points[points.length - 1].value)}
                        </text>
                    )}

                    {points.map((p, i) => (
                        <text key={p.key} x={p.x} y={VB_H - 6} className="sales-chart-x-label" textAnchor="middle">{p.label}</text>
                    ))}

                    <rect
                        className="sales-chart-hitarea"
                        x={PAD.left} y={plotTop} width={width - PAD.left - PAD.right} height={baselineY - plotTop}
                        fill="transparent"
                        onPointerMove={handlePointerMove}
                        onPointerLeave={() => setHoverIndex(null)}
                        onFocus={() => setHoverIndex(points.length - 1)}
                        onBlur={() => setHoverIndex(null)}
                        tabIndex={0}
                        aria-label={`Revenue by month: ${data.map(d => `${d.label} ${formatCompactCurrency(d.value)}`).join(', ')}`}
                    />
                </svg>

                {!hasRevenue && (
                    <div className="sales-chart-empty">No invoiced revenue in the last {data.length} months yet.</div>
                )}

                {hasRevenue && active && (
                    <div
                        className="sales-chart-tooltip"
                        style={{
                            left: `${(active.x / width) * 100}%`,
                            top: `${(active.y / VB_H) * 100}%`,
                        }}
                    >
                        <span className="sales-chart-tooltip-value">{formatCompactCurrency(active.value)}</span>
                        <span className="sales-chart-tooltip-label">{active.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesChart;
