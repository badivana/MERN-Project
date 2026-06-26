import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { DoughnutChart, AreaTrendChart, PriorityProgress } from "../components/SVGCharts";
import { CheckCircle2, Circle, AlertCircle, FileJson, FileText, ChevronRight, RefreshCw, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { apiFetch } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch analytics
            const aRes = await apiFetch("/api/tasks/analytics");
            if (aRes.ok) {
                const aData = await aRes.json();
                setAnalytics(aData);
            }

            // Fetch upcoming tasks (query tasks, sort by dueDate)
            const tRes = await apiFetch("/api/tasks?sortBy=dueDate");
            if (tRes.ok) {
                const tData = await tRes.json();
                // Filter incomplete tasks with a due date
                const incompleteWithDate = tData
                    .filter(t => t.status !== "Done" && t.dueDate)
                    .slice(0, 4); // Limit to top 4
                setUpcomingTasks(incompleteWithDate);
            }
        } catch (err) {
            console.error("Error loading dashboard metrics:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Export Tasks as JSON
    const exportTasksJSON = async () => {
        try {
            const res = await apiFetch("/api/tasks");
            if (!res.ok) throw new Error("Could not fetch tasks for export");
            const tasks = await res.json();
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
            const dlAnchor = document.createElement("a");
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "quantum_tasks_coordinates.json");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        } catch (err) {
            alert("Export failed: " + err.message);
        }
    };

    // Export Tasks as CSV
    const exportTasksCSV = async () => {
        try {
            const res = await apiFetch("/api/tasks");
            if (!res.ok) throw new Error("Could not fetch tasks for export");
            const tasks = await res.json();

            // Build headers
            const headers = ["Title", "Description", "Status", "Priority", "Category", "Due Date", "Created At"];
            const rows = tasks.map(t => [
                `"${t.title.replace(/"/g, '""')}"`,
                `"${(t.description || "").replace(/"/g, '""')}"`,
                t.status,
                t.priority,
                t.category,
                t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "None",
                new Date(t.createdAt).toISOString().split("T")[0]
            ]);

            const csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            
            const dlAnchor = document.createElement("a");
            dlAnchor.setAttribute("href", encodeURI(csvContent));
            dlAnchor.setAttribute("download", "quantum_tasks_coordinates.csv");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
        } catch (err) {
            alert("Export failed: " + err.message);
        }
    };

    if (loading && !analytics) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "var(--primary)" }}>
                <RefreshCw className="spin" size={24} />
            </div>
        );
    }

    const todoCount = analytics?.counts?.Todo || 0;
    const progressCount = analytics?.counts?.InProgress || 0;
    const reviewCount = analytics?.counts?.InReview || 0;
    const doneCount = analytics?.counts?.Done || 0;
    const pendingCount = todoCount + progressCount + reviewCount;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Page Header Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Telemetry Console</h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Real-time workspace activity matrices.</p>
                </div>
                <button 
                    onClick={loadDashboardData}
                    className="btn btn-secondary" 
                    style={{ padding: "8px 14px", fontSize: "0.8rem", gap: "6px" }}
                >
                    <RefreshCw size={12} />
                    Sync
                </button>
            </div>

            {/* KPI Cards Row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px"
            }}>
                {/* Total */}
                <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
                        <span>Total Launchpad</span>
                        <Circle size={16} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: "2rem", marginTop: "10px" }}>{analytics?.total || 0}</h2>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total logged coordinates</span>
                </div>

                {/* Done */}
                <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--success)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
                        <span>Completions</span>
                        <CheckCircle2 size={16} color="var(--success)" />
                    </div>
                    <h2 style={{ fontSize: "2rem", marginTop: "10px" }}>{doneCount}</h2>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {analytics?.total > 0 ? Math.round((doneCount / analytics.total) * 100) : 0}% Completion velocity
                    </span>
                </div>

                {/* Pending */}
                <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--secondary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
                        <span>Active Orbit</span>
                        <AlertCircle size={16} color="var(--secondary)" />
                    </div>
                    <h2 style={{ fontSize: "2rem", marginTop: "10px" }}>{pendingCount}</h2>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>In-progress or waiting tasks</span>
                </div>

                {/* Score */}
                <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--accent-purple)", background: "rgba(168, 85, 247, 0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
                        <span>Productivity score</span>
                        <CheckCircle2 size={16} color="var(--accent-purple)" />
                    </div>
                    <h2 style={{ fontSize: "2rem", marginTop: "10px", color: "#d8b4fe" }}>
                        {analytics?.productivityScore || 0}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/100</span>
                    </h2>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cosmic efficiency metric</span>
                </div>
            </div>

            {/* Graphs Row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr",
                gap: "20px"
            }} className="dashboard-grid-2">
                
                {/* Trend Chart */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", fontFamily: "var(--font-header)" }}>Weekly Productivity Stream</h3>
                    <AreaTrendChart trendData={analytics?.weeklyTrend} />
                </div>

                {/* Doughnut Chart */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", fontFamily: "var(--font-header)" }}>Sector Distribution</h3>
                    <DoughnutChart data={analytics?.counts} />
                </div>
            </div>

            {/* Bottom Row: Upcoming & Utilities */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "20px"
            }} className="dashboard-grid-bottom">
                
                {/* Upcoming deadlines */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-header)" }}>Urgent Deadlines</h3>
                        <Link to="/tasks" style={{ fontSize: "0.8rem", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                            Manage Grid <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                        {upcomingTasks.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem", height: "120px" }}>
                                No impending deadlines found. Clear skies!
                            </div>
                        ) : (
                            upcomingTasks.map(t => (
                                <div key={t._id} className="glass" style={{
                                    padding: "12px 16px",
                                    borderRadius: "var(--radius-sm)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: "1px solid rgba(255, 255, 255, 0.04)"
                                }}>
                                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: "10px" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "block" }}>{t.title}</span>
                                        <span className={`badge badge-${t.priority.toLowerCase()}`} style={{ fontSize: "0.6rem", padding: "2px 6px", marginTop: "4px" }}>
                                            {t.priority}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#f87171", fontWeight: 500 }}>
                                        <Calendar size={12} />
                                        {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Operations Dashboard Utility Card */}
                <div className="glass" style={{ padding: "25px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-header)" }}>Data Exporter</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        Backup your orbital task coordinates. Download standard operational data files directly to your command deck.
                    </p>
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginTop: "10px",
                        flex: 1,
                        justifyContent: "center"
                    }}>
                        <button 
                            onClick={exportTasksJSON}
                            className="btn btn-secondary" 
                            style={{ justifyContent: "center", padding: "12px", width: "100%", gap: "8px" }}
                        >
                            <FileJson size={16} color="var(--secondary)" />
                            Export Workspace Coordinates (JSON)
                        </button>
                        <button 
                            onClick={exportTasksCSV}
                            className="btn btn-secondary" 
                            style={{ justifyContent: "center", padding: "12px", width: "100%", gap: "8px" }}
                        >
                            <FileText size={16} color="var(--primary)" />
                            Download Task Log CSV List
                        </button>
                    </div>
                </div>

            </div>

            <style>{`
                .spin {
                    animation: spin-kf 1.5s linear infinite;
                }
                @keyframes spin-kf {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @media (max-width: 900px) {
                    .dashboard-grid-2 {
                        grid-template-columns: 1fr !important;
                    }
                    .dashboard-grid-bottom {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
