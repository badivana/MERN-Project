import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, ShieldAlert, CheckCircle2, Save, KeyRound, Sparkles } from "lucide-react";

const Profile = () => {
    const { user, updateProfile, apiFetch } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState("cosmic-blue");
    
    // Password state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // Telemetry state (overall stats)
    const [stats, setStats] = useState(null);

    // Alert feedback
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setEmail(user.email || "");
            setBio(user.bio || "");
            setAvatar(user.avatar || "cosmic-blue");
        }

        // Fetch stats
        const loadStats = async () => {
            try {
                const res = await apiFetch("/api/tasks/analytics");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to load user statistics:", err);
            }
        };
        loadStats();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword && newPassword !== confirmNewPassword) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                username,
                email,
                bio,
                avatar
            };

            if (newPassword) {
                if (user.googleId && !user.password) {
                    // Google user setting password for the first time
                    payload.newPassword = newPassword;
                } else {
                    payload.oldPassword = oldPassword;
                    payload.newPassword = newPassword;
                }
            }

            await updateProfile(payload);
            setSuccess("Cosmic profile logs updated successfully!");
            
            // Clear passwords
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            setError(err.message || "Failed to update profile logs");
        } finally {
            setLoading(false);
        }
    };

    // Avatar details
    const avatarPresets = [
        { id: "cosmic-blue", name: "Deep Space Blue", text: "🌌", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" },
        { id: "supernova-orange", name: "Supernova Orange", text: "💥", gradient: "linear-gradient(135deg, #7c2d12, #ea580c)" },
        { id: "nebula-purple", name: "Nebula Purple", text: "👾", gradient: "linear-gradient(135deg, #581c87, #a855f7)" },
        { id: "starlight-teal", name: "Starlight Teal", text: "✨", gradient: "linear-gradient(135deg, #115e59, #14b8a6)" }
    ];

    const currentAvatar = avatarPresets.find(p => p.id === avatar) || avatarPresets[0];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Header */}
            <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Commander Profile Deck</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Manage your credentials and coordinate telemetry.</p>
            </div>

            {/* Profile Content */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 2fr",
                gap: "25px"
            }} className="profile-layout-grid">
                
                {/* Left Card: Summary & Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Character Card */}
                    <div className="glass" style={{
                        padding: "30px 20px",
                        borderRadius: "var(--radius-lg)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "15px"
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: currentAvatar.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.8rem",
                            boxShadow: `0 0 25px rgba(255,255,255,0.08)`,
                            marginBottom: "5px"
                        }}>
                            {currentAvatar.text}
                        </div>
                        
                        <div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{user?.username}</h3>
                            <span style={{ fontSize: "0.75rem", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {user?.role || "Workspace Commander"}
                            </span>
                        </div>
                        
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.4 }}>
                            "{user?.bio || "Cabin logs are clear."}"
                        </p>
                    </div>

                    {/* Telemetry Stats Panel */}
                    <div className="glass" style={{ padding: "20px", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "15px" }}>
                        <h4 style={{ fontSize: "0.95rem", fontFamily: "var(--font-header)" }}>Command Telemetry</h4>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Authorization Sphere:</span>
                                <span style={{ fontWeight: 600, color: user?.googleId ? "var(--secondary)" : "var(--text-primary)" }}>
                                    {user?.googleId ? "Google OAuth" : "Native Cabin"}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Total Tasks Created:</span>
                                <span style={{ fontWeight: 600 }}>{stats?.total || 0}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Completions:</span>
                                <span style={{ fontWeight: 600, color: "var(--success)" }}>{stats?.counts?.Done || 0}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Efficiency Score:</span>
                                <span style={{ fontWeight: 600, color: "var(--accent-purple)" }}>{stats?.productivityScore || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Card: Editor Form */}
                <div className="glass" style={{ padding: "30px", borderRadius: "var(--radius-lg)" }}>
                    {/* Success/Error Alerts */}
                    {error && (
                        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#f87171", marginBottom: "20px" }}>
                            <ShieldAlert size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--success)", marginBottom: "20px" }}>
                            <CheckCircle2 size={16} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-header)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>Cabin Profile</h3>
                        
                        {/* Username */}
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input 
                                type="email" 
                                className="form-input" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Bio */}
                        <div className="form-group">
                            <label className="form-label">Cabin Bio Log</label>
                            <textarea 
                                className="form-input" 
                                rows={2} 
                                style={{ resize: "none" }}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Avatar Select presets */}
                        <div className="form-group">
                            <label className="form-label">Avatar Identity Theme</label>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                                gap: "10px",
                                marginTop: "5px"
                            }}>
                                {avatarPresets.map(preset => (
                                    <div 
                                        key={preset.id}
                                        onClick={() => setAvatar(preset.id)}
                                        className="glass-interactive"
                                        style={{
                                            padding: "10px",
                                            borderRadius: "var(--radius-md)",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            border: avatar === preset.id ? "1.5px solid var(--secondary)" : "1.5px solid rgba(255,255,255,0.04)",
                                            background: avatar === preset.id ? "rgba(6, 182, 212, 0.08)" : "var(--bg-card)"
                                        }}
                                    >
                                        <span style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            background: preset.gradient,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.9rem"
                                        }}>
                                            {preset.text}
                                        </span>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{preset.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Password Segment */}
                        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                            <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-header)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <KeyRound size={16} />
                                Security Credentials
                            </h3>

                            {user?.googleId && !user?.password ? (
                                <div style={{
                                    backgroundColor: "rgba(6, 182, 212, 0.06)",
                                    border: "1px solid rgba(6, 182, 212, 0.15)",
                                    padding: "10px 12px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                    lineHeight: 1.4,
                                    display: "flex",
                                    gap: "8px"
                                }}>
                                    <Sparkles size={16} color="var(--secondary)" style={{ flexShrink: 0 }} />
                                    <span>
                                        You are logged in with Google. You can set a password below to enable logging in via standard credentials.
                                    </span>
                                </div>
                            ) : null}

                            {/* Old password (if applicable) */}
                            {user?.password && (
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Enter current password..."
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {/* New password row */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "15px"
                            }} className="password-grid-row">
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="New password..."
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-input" 
                                        placeholder="Confirm new password..."
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                style={{ gap: "6px" }}
                                disabled={loading}
                            >
                                <Save size={16} />
                                {loading ? "Updating Logs..." : "Save Log Changes"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>

            <style>{`
                @media (max-width: 900px) {
                    .profile-layout-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .password-grid-row {
                        grid-template-columns: 1fr !important;
                        gap: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
