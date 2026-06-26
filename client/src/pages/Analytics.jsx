import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DoughnutChart, AreaTrendChart, PriorityProgress } from "../components/SVGCharts";
import { Sparkles, Calendar, CheckSquare, BarChart3, TrendingUp, Info } from "lucide-react";

const Analytics = () => {
    const { apiFetch } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAnalyticsData = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/api/tasks/analytics");
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (err) {
            console.error("Error loading analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalyticsData();
    }, []);

    if (loading && !analytics) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "var(--primary)" }}>
                <div style={{
                    width: "30px",
                    height: "30px",
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    borderTop: "2px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}></div>
            </div>
        );
    }

    // Category calculation helper
    const getCategoryPercentages = () => {
        if (!analytics || analytics.total === 0) return [];
        const cats = analytics.categories || {};
        return Object.keys(cats).map(key => ({
            name: key,
            count: cats[key],
            percentage: Math.round((cats[key] / analytics.total) * 100)
        })).sort((a,b) => b.count - a.count);
    };

    const categoryStats = getCategoryPercentages();
    const subtasksPct = analytics?.subtaskStats?.total > 0 
        ? Math.round((analytics.subtaskStats.completed / analytics.subtaskStats.total) * 100) 
        : 100;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Header */}
            <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Workspace Telemetry</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Advanced productivity telemetry and workload distributions.</p>
            </div>

            {/* Top row: Productivity Score details & Workload by Sphere */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "20px"
            }} className="analytics-grid-top">
                
                {/* Detailed Productivity Score */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-header)" }}>
                        <Sparkles size={16} color="var(--accent-purple)" />
                        Productivity Rating
                    </h3>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "30px", flexWrap: "wrap", margin: "10px 0" }}>
                        <div style={{ position: "relative", width: "100px", height: "100px" }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    fill="transparent" 
                                    stroke="var(--accent-purple)" 
                                    strokeWidth="6" 
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analytics?.productivityScore || 0) / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                                />
                            </svg>
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "1.6rem", fontWeight: 800 }}>
                                {analytics?.productivityScore || 0}%
                            </div>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                            <h4 style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
                                {analytics?.productivityScore > 75 ? "Exceptional Pilot Rating" : analytics?.productivityScore > 40 ? "Stable Orbit Speed" : "Low Acceleration"}
                            </h4>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                Score is dynamically formulated from task completions, high priority items resolved, and checklist items completed.
                            </p>
                        </div>
                    </div>

                    {/* Stats table */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                <CheckSquare size={14} /> Completion Rate
                            </span>
                            <span style={{ fontWeight: 600 }}>
                                {analytics?.counts?.Done || 0} / {analytics?.total || 0} tasks
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                <TrendingUp size={14} /> Checklist progress
                            </span>
                            <span style={{ fontWeight: 600 }}>
                                {analytics?.subtaskStats?.completed || 0} / {analytics?.subtaskStats?.total || 0} items ({subtasksPct}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sphere/Category workloads */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-header)" }}>Workload by Sphere</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1, justifyContent: "center" }}>
                        {categoryStats.length === 0 ? (
                            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                                No category vectors populated.
                            </div>
                        ) : (
                            categoryStats.map(cat => (
                                <div key={cat.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 500 }}>
                                        <span>{cat.name}</span>
                                        <span style={{ color: "var(--text-secondary)" }}>{cat.count} tasks ({cat.percentage}%)</span>
                                    </div>
                                    <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{
                                            width: `${cat.percentage}%`,
                                            height: "100%",
                                            background: "linear-gradient(to right, var(--primary), var(--secondary))",
                                            borderRadius: "3px"
                                        }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Graphs Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 1fr",
                gap: "20px"
            }} className="analytics-grid-graphs">
                
                {/* Trend Chart */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-header)" }}>
                        <BarChart3 size={16} color="var(--secondary)" />
                        Productivity Velocity
                    </h3>
                    <AreaTrendChart trendData={analytics?.weeklyTrend} />
                </div>

                {/* Priority distribution */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-header)" }}>Priority Load Weights</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Distribution of task severity levels.</p>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                        <PriorityProgress priorities={analytics?.priorities} />
                    </div>
                </div>
            </div>

            {/* Doughnut distribution */}
            <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", fontFamily: "var(--font-header)" }}>Sector Health / Status Map</h3>
                <DoughnutChart data={analytics?.counts} />
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .analytics-grid-top {
                        grid-template-columns: 1fr !important;
                    }
                    .analytics-grid-graphs {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Analytics;
