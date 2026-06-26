import React from "react";

// ==========================================
// 1. DOUGHNUT CHART (Status Distribution)
// ==========================================
export const DoughnutChart = ({ data = {} }) => {
    const todo = data.Todo || 0;
    const inProgress = data.InProgress || 0;
    const inReview = data.InReview || 0;
    const done = data.Done || 0;
    const total = todo + inProgress + inReview + done;

    if (total === 0) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: "var(--text-muted)",
                fontSize: "0.9rem"
            }}>
                No task coordinates logged yet.
            </div>
        );
    }

    const segments = [
        { key: "Todo", value: todo, color: "#94a3b8", label: "To Do" },
        { key: "InProgress", value: inProgress, color: "#06b6d4", label: "In Progress" },
        { key: "InReview", value: inReview, color: "#a855f7", label: "In Review" },
        { key: "Done", value: done, color: "#10b981", label: "Completed" }
    ].filter(s => s.value > 0);

    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.16

    let accumulatedPercentage = 0;

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                    {/* Background Circle */}
                    <circle 
                        cx="60" 
                        cy="60" 
                        r={radius} 
                        fill="transparent" 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="10" 
                    />
                    {/* Data Segments */}
                    {segments.map((seg, idx) => {
                        const percentage = seg.value / total;
                        const strokeLength = percentage * circumference;
                        const strokeOffset = circumference - (accumulatedPercentage * circumference);
                        accumulatedPercentage += percentage;

                        return (
                            <circle
                                key={seg.key}
                                cx="60"
                                cy="60"
                                r={radius}
                                fill="transparent"
                                stroke={seg.color}
                                strokeWidth="10"
                                strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                                strokeDashoffset={strokeOffset}
                                strokeLinecap="round"
                                style={{
                                    transition: "stroke-dashoffset 0.8s ease-out",
                                    filter: `drop-shadow(0 0 3px ${seg.color}44)`
                                }}
                            />
                        );
                    })}
                </svg>
                {/* Center Content */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center"
                }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "var(--font-header)", display: "block" }}>
                        {total}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Total Tasks
                    </span>
                </div>
            </div>

            {/* Legends */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {segments.map(seg => (
                    <div key={seg.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "4px",
                            backgroundColor: seg.color,
                            boxShadow: `0 0 8px ${seg.color}66`
                        }}></span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{seg.label}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {seg.value} tasks ({Math.round((seg.value / total) * 100)}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 2. AREA TREND CHART (Weekly Productivity)
// ==========================================
export const AreaTrendChart = ({ trendData = [] }) => {
    if (trendData.length === 0) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
                color: "var(--text-muted)"
            }}>
                Awaiting productivity telemetry...
            </div>
        );
    }

    const width = 500;
    const height = 180;
    const padding = 30;

    const maxVal = Math.max(...trendData.map(d => d.completed), 4); // Min scale is 4

    // Map points to coordinates
    const points = trendData.map((d, index) => {
        const x = padding + (index * (width - 2 * padding)) / (trendData.length - 1);
        // Invert Y coordinate since SVG (0,0) is top-left
        const y = height - padding - (d.completed * (height - 2 * padding)) / maxVal;
        return { x, y, label: d.day, val: d.completed };
    });

    // Create Path String
    let linePath = "";
    let areaPath = "";

    if (points.length > 0) {
        linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
        areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    }

    return (
        <div style={{ width: "100%", overflowX: "auto" }}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = padding + ratio * (height - 2 * padding);
                    return (
                        <line
                            key={idx}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Shaded Area */}
                {areaPath && (
                    <path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        style={{
                            animation: "dash-fade 1s ease-out forwards"
                        }}
                    />
                )}

                {/* Trend Line */}
                {linePath && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="var(--secondary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{
                            filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))"
                        }}
                    />
                )}

                {/* Data Points / Circles */}
                {points.map((p, idx) => (
                    <g key={idx}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="var(--bg-dark)"
                            stroke="var(--secondary)"
                            strokeWidth="2.5"
                            style={{ cursor: "pointer", transition: "r 0.15s ease-out" }}
                            onMouseOver={(e) => e.target.setAttribute("r", "7")}
                            onMouseOut={(e) => e.target.setAttribute("r", "5")}
                        />
                        {/* Tooltip Count */}
                        {p.val > 0 && (
                            <text
                                x={p.x}
                                y={p.y - 10}
                                fill="#ffffff"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {p.val}
                            </text>
                        )}
                        {/* X-Axis labels */}
                        <text
                            x={p.x}
                            y={height - 10}
                            fill="var(--text-muted)"
                            fontSize="10"
                            textAnchor="middle"
                        >
                            {p.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// ==========================================
// 3. PRIORITY WORKLOAD CARD (Progress Rings)
// ==========================================
export const PriorityProgress = ({ priorities = {} }) => {
    const low = priorities.Low || 0;
    const med = priorities.Medium || 0;
    const high = priorities.High || 0;
    const total = low + med + high;

    const renderRing = (label, val, color) => {
        const pct = total > 0 ? (val / total) : 0;
        const radius = 22;
        const circ = 2 * Math.PI * radius; // ~138
        const strokeOffset = circ - (pct * circ);

        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                minWidth: "90px"
            }}>
                <div style={{ position: "relative", width: "60px", height: "60px" }}>
                    <svg width="100%" height="100%" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                        <circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            fill="transparent" 
                            stroke="rgba(255,255,255,0.03)" 
                            strokeWidth="5" 
                        />
                        <circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            fill="transparent" 
                            stroke={color} 
                            strokeWidth="5" 
                            strokeDasharray={`${pct * circ} ${circ - (pct * circ)}`}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            style={{
                                transition: "stroke-dashoffset 0.8s ease-out",
                                filter: `drop-shadow(0 0 2px ${color}44)`
                            }}
                        />
                    </svg>
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "0.95rem",
                        fontWeight: 700
                    }}>
                        {val}
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, display: "block" }}>{label}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                        {total > 0 ? Math.round(pct * 100) : 0}% Ratio
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", width: "100%" }}>
            {renderRing("High", high, "var(--danger)")}
            {renderRing("Medium", med, "var(--warning)")}
            {renderRing("Low", low, "var(--success)")}
        </div>
    );
};
