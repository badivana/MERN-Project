import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, BarChart3, User, LogOut, Rocket } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const { user, logout } = useAuth();

    // Map avatar preset strings to gradient styles or symbols
    const getAvatarPreset = (presetName) => {
        const presets = {
            "cosmic-blue": { text: "🌌", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" },
            "supernova-orange": { text: "💥", gradient: "linear-gradient(135deg, #7c2d12, #ea580c)" },
            "nebula-purple": { text: "👾", gradient: "linear-gradient(135deg, #581c87, #a855f7)" },
            "starlight-teal": { text: "✨", gradient: "linear-gradient(135deg, #115e59, #14b8a6)" }
        };
        return presets[presetName] || presets["cosmic-blue"];
    };

    const avatarInfo = getAvatarPreset(user?.avatar);

    return (
        <aside className="glass" style={{
            width: "var(--sidebar-width)",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            borderRight: "1px solid var(--border-color)",
            padding: "25px 15px"
        }}>
            {/* Logo */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "40px",
                paddingLeft: "10px"
            }}>
                <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 15px rgba(99,102,241,0.4)"
                }} className="floating-icon">
                    <Rocket size={18} color="#fff" />
                </div>
                <span style={{
                    fontFamily: "var(--font-header)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    background: "linear-gradient(to right, #ffffff, #94a3b8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    QuantumTask
                </span>
            </div>

            {/* Navigation Menu */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink 
                    to="/tasks" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <CheckSquare size={20} />
                    <span>My Tasks</span>
                </NavLink>

                <NavLink 
                    to="/analytics" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <BarChart3 size={20} />
                    <span>Analytics</span>
                </NavLink>

                <NavLink 
                    to="/profile" 
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    <User size={20} />
                    <span>Profile</span>
                </NavLink>
            </nav>

            {/* User Profile Card */}
            {user && (
                <div className="glass" style={{
                    padding: "15px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: avatarInfo.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            boxShadow: "0 0 10px rgba(255,255,255,0.05)"
                        }}>
                            {avatarInfo.text}
                        </div>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                {user.username}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user.role || "Commander"}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={logout}
                        className="btn btn-danger" 
                        style={{
                            padding: "8px 12px",
                            fontSize: "0.8rem",
                            width: "100%",
                            justifyContent: "center",
                            gap: "6px"
                        }}
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            )}

            {/* Custom Link CSS */}
            <style>{`
                .sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    font-family: var(--font-header);
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: var(--transition-fast);
                    border: 1px solid transparent;
                }
                
                .sidebar-link:hover {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.03);
                }
                
                .sidebar-link.active {
                    color: #fff;
                    background: var(--primary-glow);
                    border-color: rgba(99, 102, 241, 0.15);
                    box-shadow: 0 0 12px rgba(99, 102, 241, 0.1);
                }
                
                .sidebar-link.active svg {
                    color: var(--secondary);
                }
                
                @media (max-width: 1024px) {
                    aside {
                        width: 80px !important;
                        padding: 25px 10px !important;
                    }
                    aside span, aside nav span, aside button span, aside .glass {
                        display: none !important;
                    }
                    aside .sidebar-link {
                        justify-content: center;
                        padding: 12px !important;
                    }
                }
                @media (max-width: 640px) {
                    aside {
                        width: 100vw !important;
                        height: 60px !important;
                        position: fixed !important;
                        bottom: 0 !important;
                        top: auto !important;
                        flex-direction: row !important;
                        justify-content: space-around !important;
                        padding: 5px !important;
                        border-top: 1px solid var(--border-color);
                        border-right: none !important;
                    }
                    aside .floating-icon {
                        display: none !important;
                    }
                    aside nav {
                        flex-direction: row !important;
                        width: 100% !important;
                        justify-content: space-around !important;
                        gap: 0 !important;
                    }
                    aside .sidebar-link {
                        padding: 8px !important;
                    }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
