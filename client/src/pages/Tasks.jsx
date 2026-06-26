import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { Plus, Search, Filter, Kanban, LayoutGrid, RotateCcw } from "lucide-react";

const Tasks = () => {
    const { apiFetch } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Search State
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");
    const [statusFilter, setStatusFilter] = useState(""); // For List view only
    const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'grid'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Fetch tasks based on filters
    const loadTasks = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (category) params.append("category", category);
            if (priority) params.append("priority", priority);
            // In kanban view, we don't apply status query filter (we want all columns)
            if (viewMode === "grid" && statusFilter) {
                params.append("status", statusFilter);
            }

            const res = await apiFetch(`/api/tasks?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (err) {
            console.error("Error loading tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load tasks on state changes
    useEffect(() => {
        loadTasks();
    }, [search, category, priority, statusFilter, viewMode]);

    // Handle Create/Update save trigger
    const handleSaveTask = async (taskData) => {
        try {
            let res;
            if (taskData._id) {
                // Update
                res = await apiFetch(`/api/tasks/${taskData._id}`, {
                    method: "PUT",
                    body: JSON.stringify(taskData)
                });
            } else {
                // Create
                res = await apiFetch("/api/tasks", {
                    method: "POST",
                    body: JSON.stringify(taskData)
                });
            }

            if (res.ok) {
                setIsModalOpen(false);
                loadTasks();
            } else {
                let errMsg = "Unknown error";
                try {
                    const err = await res.json();
                    errMsg = err.message || err.error || errMsg;
                } catch {
                    try {
                        errMsg = await res.text() || res.statusText || errMsg;
                    } catch {
                        errMsg = res.statusText || errMsg;
                    }
                }
                alert("Operation failed: " + errMsg);
            }
        } catch (err) {
            console.error("Error saving task:", err);
            alert("Error saving task: " + err.message);
        }
    };

    // Fast status change trigger
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const res = await apiFetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                loadTasks();
            }
        } catch (err) {
            console.error("Error changing task status:", err);
        }
    };

    // Delete trigger
    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task coordinates?")) return;
        try {
            const res = await apiFetch(`/api/tasks/${taskId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                loadTasks();
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearch("");
        setCategory("");
        setPriority("");
        setStatusFilter("");
    };

    const openCreateModal = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    // Kanban categorizer
    const getKanbanColumns = () => {
        const cols = {
            Todo: { title: "To Do", color: "var(--text-secondary)", list: [] },
            InProgress: { title: "In Progress", color: "var(--secondary)", list: [] },
            InReview: { title: "In Review", color: "var(--accent-purple)", list: [] },
            Done: { title: "Completed", color: "var(--success)", list: [] }
        };

        tasks.forEach(task => {
            if (cols[task.status]) {
                cols[task.status].list.push(task);
            }
        });

        return cols;
    };

    const kanbanColumns = getKanbanColumns();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* Header section with add task button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Task Grid System</h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Manage operational checklogs and coordinates.</p>
                </div>
                
                <button 
                    onClick={openCreateModal}
                    className="btn btn-primary"
                    style={{ gap: "6px" }}
                >
                    <Plus size={16} />
                    Launch Task
                </button>
            </div>

            {/* Filter and View mode controls */}
            <div className="glass" style={{
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px"
                }}>
                    {/* View mode toggle */}
                    <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "10px" }}>
                        <button 
                            onClick={() => setViewMode("kanban")}
                            className={`btn ${viewMode === "kanban" ? "btn-secondary" : ""}`}
                            style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px", border: "none", background: viewMode === "kanban" ? "rgba(255,255,255,0.08)" : "transparent" }}
                        >
                            <Kanban size={14} style={{ marginRight: "4px" }} />
                            Kanban Board
                        </button>
                        <button 
                            onClick={() => setViewMode("grid")}
                            className={`btn ${viewMode === "grid" ? "btn-secondary" : ""}`}
                            style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px", border: "none", background: viewMode === "grid" ? "rgba(255,255,255,0.08)" : "transparent" }}
                        >
                            <LayoutGrid size={14} style={{ marginRight: "4px" }} />
                            Flat Grid
                        </button>
                    </div>

                    {/* Search */}
                    <div style={{ position: "relative", flex: 1, maxWidth: "300px", minWidth: "200px" }}>
                        <Search size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Search coordinates..." 
                            style={{ paddingLeft: "38px" }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters row */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap"
                }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Filter size={12} />
                        Filter:
                    </span>

                    {/* Category filter */}
                    <select 
                        className="form-input" 
                        style={{ width: "auto", minWidth: "120px", padding: "8px 12px", fontSize: "0.85rem" }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Spheres</option>
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                    </select>

                    {/* Priority filter */}
                    <select 
                        className="form-input" 
                        style={{ width: "auto", minWidth: "120px", padding: "8px 12px", fontSize: "0.85rem" }}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="">All Velocities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>

                    {/* Status filter (List view only) */}
                    {viewMode === "grid" && (
                        <select 
                            className="form-input" 
                            style={{ width: "auto", minWidth: "120px", padding: "8px 12px", fontSize: "0.85rem" }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Sectors</option>
                            <option value="Todo">To Do</option>
                            <option value="InProgress">In Progress</option>
                            <option value="InReview">In Review</option>
                            <option value="Done">Completed</option>
                        </select>
                    )}

                    {/* Reset button */}
                    {(search || category || priority || statusFilter) && (
                        <button 
                            onClick={resetFilters}
                            className="btn btn-secondary" 
                            style={{ padding: "8px 12px", fontSize: "0.8rem", border: "none", gap: "4px" }}
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Tasks render */}
            {loading && tasks.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "50px", color: "var(--primary)" }}>
                    <div style={{
                        width: "30px",
                        height: "30px",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderTop: "2px solid #6366f1",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="glass" style={{ padding: "50px", textAlign: "center", borderRadius: "var(--radius-lg)", color: "var(--text-secondary)" }}>
                    <h3>Workspace Grid is Clear</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "8px" }}>No tasks matched current operational filters.</p>
                </div>
            ) : viewMode === "kanban" ? (
                /* Kanban View */
                <div className="kanban-container" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                    alignItems: "start"
                }}>
                    {Object.keys(kanbanColumns).map(colKey => {
                        const column = kanbanColumns[colKey];
                        return (
                            <div key={colKey} className="glass kanban-column" style={{
                                padding: "16px",
                                borderRadius: "var(--radius-lg)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "15px",
                                minHeight: "500px",
                                background: "rgba(10, 11, 22, 0.45)"
                            }}>
                                {/* Column Header */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    paddingBottom: "10px",
                                    borderBottom: "1px solid var(--border-color)"
                                }}>
                                    <span style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-header)", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: column.color }}></span>
                                        {column.title}
                                    </span>
                                    <span className="badge" style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", fontSize: "0.7rem", padding: "2px 8px" }}>
                                        {column.list.length}
                                    </span>
                                </div>

                                {/* Column List */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "70vh" }}>
                                    {column.list.map(task => (
                                        <TaskCard 
                                            key={task._id} 
                                            task={task} 
                                            onEdit={openEditModal}
                                            onDelete={handleDeleteTask}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Flat Grid View */
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px"
                }}>
                    {tasks.map(task => (
                        <TaskCard 
                            key={task._id} 
                            task={task} 
                            onEdit={openEditModal}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}

            {/* Task modal structure */}
            <TaskModal 
                isOpen={isModalOpen}
                task={selectedTask}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
            />

            <style>{`
                @media (max-width: 768px) {
                    .kanban-container {
                        grid-template-columns: 1fr !important;
                    }
                    .kanban-column {
                        min-height: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Tasks;
