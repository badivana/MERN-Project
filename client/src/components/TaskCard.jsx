import React from "react";
import { Edit2, Trash2, Calendar, CheckSquare, ChevronRight, Check } from "lucide-react";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
    // Formatter for due dates
    const formatDueDate = (dateString) => {
        if (!dateString) return "No due date";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Check if task is overdue
    const isOverdue = (dateString, status) => {
        if (!dateString || status === "Done") return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Calculate subtasks progress percentage
    const getSubtasksProgress = () => {
        if (!task.subtasks || task.subtasks.length === 0) return null;
        const total = task.subtasks.length;
        const completed = task.subtasks.filter(sub => sub.completed).length;
        return {
            total,
            completed,
            percentage: Math.round((completed / total) * 100)
        };
    };

    const subtaskProgress = getSubtasksProgress();

    // Advance status logic
    const advanceStatus = () => {
        let nextStatus;
        if (task.status === "Todo") nextStatus = "InProgress";
        else if (task.status === "InProgress") nextStatus = "InReview";
        else if (task.status === "InReview") nextStatus = "Done";
        else return; // Already Done

        onStatusChange(task._id, nextStatus);
    };

    const getStatusTextAndColor = (status) => {
        switch (status) {
            case "Todo": return { text: "To Do", badgeClass: "badge-todo" };
            case "InProgress": return { text: "In Progress", badgeClass: "badge-inprogress" };
            case "InReview": return { text: "In Review", badgeClass: "badge-inreview" };
            case "Done": return { text: "Completed", badgeClass: "badge-done" };
            default: return { text: status, badgeClass: "badge-todo" };
        }
    };

    const statusDetails = getStatusTextAndColor(task.status);
    const overdue = isOverdue(task.dueDate, task.status);

    return (
        <div className="glass glass-interactive" style={{
            padding: "20px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Left Accent Color Indicator based on priority */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "100%",
                backgroundColor: 
                    task.priority === "High" ? "var(--danger)" :
                    task.priority === "Medium" ? "var(--warning)" :
                    "var(--success)"
            }}></div>

            {/* Header: Category & Priority */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                }}>
                    {task.category}
                </span>
                
                <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
            </div>

            {/* Title & Description */}
            <div>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                    textDecoration: task.status === "Done" ? "line-through" : "none",
                    opacity: task.status === "Done" ? 0.6 : 1
                }}>
                    {task.title}
                </h3>
                {task.description && (
                    <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        {task.description}
                    </p>
                )}
            </div>

            {/* Subtask progress bar */}
            {subtaskProgress && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckSquare size={12} />
                            Checklist ({subtaskProgress.completed}/{subtaskProgress.total})
                        </span>
                        <span>{subtaskProgress.percentage}%</span>
                    </div>
                    <div style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: "3px",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            width: `${subtaskProgress.percentage}%`,
                            height: "100%",
                            background: "linear-gradient(to right, var(--primary), var(--secondary))",
                            borderRadius: "3px",
                            transition: "width 0.4s ease-in-out"
                        }}></div>
                    </div>
                </div>
            )}

            {/* Footer Divider */}
            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)", margin: "4px 0" }}></div>

            {/* Footer: Date & Quick Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Date */}
                <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    fontSize: "0.8rem",
                    color: overdue ? "#f87171" : "var(--text-muted)"
                }}>
                    <Calendar size={14} />
                    <span style={{ fontWeight: overdue ? 600 : 400 }}>
                        {formatDueDate(task.dueDate)}
                        {overdue && " (Overdue)"}
                    </span>
                </div>

                {/* Operations */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Fast Status Advancer */}
                    {task.status !== "Done" && (
                        <button 
                            onClick={advanceStatus}
                            className="btn glass"
                            title={`Move to ${task.status === "Todo" ? "In Progress" : task.status === "InProgress" ? "In Review" : "Completed"}`}
                            style={{
                                width: "28px",
                                height: "28px",
                                padding: 0,
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyItems: "center",
                                justifyContent: "center",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "var(--secondary)"
                            }}
                        >
                            <ChevronRight size={14} />
                        </button>
                    )}
                    {task.status === "Done" && (
                        <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--success)",
                            border: "1px solid rgba(16, 185, 129, 0.2)"
                        }}>
                            <Check size={14} />
                        </div>
                    )}

                    {/* Edit */}
                    <button 
                        onClick={() => onEdit(task)}
                        className="btn glass-interactive"
                        style={{
                            width: "28px",
                            height: "28px",
                            padding: 0,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "var(--text-secondary)"
                        }}
                    >
                        <Edit2 size={12} />
                    </button>

                    {/* Delete */}
                    <button 
                        onClick={() => onDelete(task._id)}
                        className="btn btn-danger"
                        style={{
                            width: "28px",
                            height: "28px",
                            padding: 0,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
