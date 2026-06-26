import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, Sparkles } from "lucide-react";

const Header = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Map path to title
    const getPageTitle = (path) => {
        switch (path) {
            case "/dashboard": return "Command Center";
            case "/tasks": return "Task Grid";
            case "/analytics": return "Cosmic Analytics";
            case "/profile": return "Commander Profile";
            default: return "Dashboard";
        }
    };

    // Date formatter
    const getFormattedDate = () => {
        return new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <header className="glass" style={{
            height: "var(--header-height)",
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 40px",
            zIndex: 90,
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "rgba(7, 8, 15, 0.4)",
            backdropFilter: "blur(8px)"
        }}>
            {/* Page Title & Breadcrumb */}
            <div>
                <h1 style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-header)",
                    color: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    {getPageTitle(location.pathname)}
                    <Sparkles size={16} color="var(--secondary)" />
                </h1>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {getFormattedDate()}
                </p>
            </div>

            {/* Quick Actions & Profile Greeting */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                {/* Notification Bell */}
                <div className="glass-interactive" style={{
                    position: "relative",
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)"
                }}>
                    <Bell size={18} color="var(--text-secondary)" />
                    <span style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--secondary)",
                        boxShadow: "0 0 8px var(--secondary)"
                    }}></span>
                </div>

                {/* Profile Greeting */}
                {user && (
                    <div style={{ textAlign: "right" }} className="hide-mobile">
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                            Welcome back,
                        </span>
                        <span style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "var(--text-primary)"
                        }}>
                            {user.username}
                        </span>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 640px) {
                    header {
                        padding: 0 16px !important;
                        position: fixed !important;
                        top: 0;
                        width: 100vw;
                    }
                    .hide-mobile {
                        display: none !important;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;
