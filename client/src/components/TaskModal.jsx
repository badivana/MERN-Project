import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const TaskModal = ({ isOpen, task, onClose, onSave }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Todo");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("Work");
    const [dueDate, setDueDate] = useState("");
    
    // Subtasks / Checklist State
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtaskText, setNewSubtaskText] = useState("");

    // Populate modal when editing a task
    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setStatus(task.status || "Todo");
            setPriority(task.priority || "Medium");
            setCategory(task.category || "Work");
            
            // Format due date to YYYY-MM-DD
            if (task.dueDate) {
                const date = new Date(task.dueDate);
                setDueDate(date.toISOString().split("T")[0]);
            } else {
                setDueDate("");
            }
            
            setSubtasks(task.subtasks || []);
        } else {
            // Reset to defaults for creating a new task
            setTitle("");
            setDescription("");
            setStatus("Todo");
            setPriority("Medium");
            setCategory("Work");
            setDueDate("");
            setSubtasks([]);
        }
        setNewSubtaskText("");
    }, [task, isOpen]);

    if (!isOpen) return null;

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const taskData = {
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            category,
            dueDate: dueDate ? new Date(dueDate) : null,
            subtasks
        };

        if (task) {
            taskData._id = task._id;
        }

        onSave(taskData);
    };

    // Subtask managers
    const addSubtask = () => {
        if (!newSubtaskText.trim()) return;
        setSubtasks([...subtasks, { text: newSubtaskText.trim(), completed: false }]);
        setNewSubtaskText("");
    };

    const toggleSubtask = (index) => {
        const updated = [...subtasks];
        updated[index].completed = !updated[index].completed;
        setSubtasks(updated);
    };

    const deleteSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(3, 4, 9, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
        }}>
            <div className="glass" style={{
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                borderRadius: "var(--radius-lg)",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: "column"
            }}>
                {/* Modal Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 24px",
                    borderBottom: "1px solid var(--border-color)"
                }}>
                    <h2 style={{
                        fontSize: "1.35rem",
                        fontFamily: "var(--font-header)",
                        fontWeight: 700
                    }}>
                        {task ? "Modify Task Coordinates" : "Launch New Task"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="btn glass-interactive" 
                        style={{ width: "32px", height: "32px", padding: 0, borderRadius: "50%" }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Task Identifier / Title</label>
                        <input 
                            type="text" 
                            className="form-input"
                            required
                            placeholder="Orbit alignment, Code deployment..." 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Task Log / Description</label>
                        <textarea 
                            className="form-input"
                            placeholder="Provide task operational logs..."
                            rows={3}
                            style={{ resize: "none" }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Parameters row */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "16px"
                    }}>
                        {/* Status */}
                        <div className="form-group">
                            <label className="form-label">Sector / Status</label>
                            <select 
                                className="form-input"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="Todo">To Do</option>
                                <option value="InProgress">In Progress</option>
                                <option value="InReview">In Review</option>
                                <option value="Done">Completed</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="form-group">
                            <label className="form-label">Velocity / Priority</label>
                            <select 
                                className="form-input"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label">Sphere / Category</label>
                            <select 
                                className="form-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="Work">Work</option>
                                <option value="Personal">Personal</option>
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="form-group">
                        <label className="form-label">Deadline / Due Date</label>
                        <input 
                            type="date" 
                            className="form-input"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    {/* Subtasks / Checklist Segment */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label className="form-label">Operational Checklist (Subtasks)</label>
                        
                        {/* List of subtasks */}
                        {subtasks.length > 0 && (
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                background: "rgba(0,0,0,0.15)",
                                padding: "12px",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-color)",
                                maxHeight: "150px",
                                overflowY: "auto"
                            }}>
                                {subtasks.map((sub, index) => (
                                    <div key={index} style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "10px"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                                            <input 
                                                type="checkbox" 
                                                checked={sub.completed}
                                                onChange={() => toggleSubtask(index)}
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    accentColor: "var(--secondary)",
                                                    cursor: "pointer"
                                                }}
                                            />
                                            <span style={{
                                                fontSize: "0.85rem",
                                                textDecoration: sub.completed ? "line-through" : "none",
                                                color: sub.completed ? "var(--text-muted)" : "var(--text-primary)"
                                            }}>
                                                {sub.text}
                                            </span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => deleteSubtask(index)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#f87171",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Inline subtask adder */}
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="Add checklist item..."
                                style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem" }}
                                value={newSubtaskText}
                                onChange={(e) => setNewSubtaskText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addSubtask();
                                    }
                                }}
                            />
                            <button 
                                type="button"
                                onClick={addSubtask}
                                className="btn btn-secondary"
                                style={{ padding: "8px 12px" }}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "10px",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "20px"
                    }}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary"
                        >
                            {task ? "Update Coordinates" : "Confirm Launch"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TaskModal;
