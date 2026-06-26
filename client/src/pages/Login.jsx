import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Rocket, ShieldAlert, KeyRound, User } from "lucide-react";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleClientId, setGoogleClientId] = useState("");

    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    // Fetch Google Client ID on mount
    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const res = await fetch("/api/auth/google-client-id");
                if (res.ok) {
                    const data = await res.json();
                    if (data.clientId && !data.clientId.includes("your-google-client-id")) {
                        setGoogleClientId(data.clientId);
                    }
                }
            } catch (err) {
                console.error("Failed to load Google Client ID config:", err);
            }
        };
        fetchClientId();
    }, []);

    // Initialize Google Button
    useEffect(() => {
        /* global google */
        if (googleClientId && typeof google !== "undefined") {
            try {
                google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleResponse
                });
                google.accounts.id.renderButton(
                    document.getElementById("googleBtn"),
                    { theme: "outline", size: "large", width: "320" }
                );
            } catch (err) {
                console.error("Failed to render Google login button:", err);
            }
        }
    }, [googleClientId]);

    const handleGoogleResponse = async (response) => {
        setError("");
        setLoading(true);
        try {
            await googleLogin(response.credential);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Google Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) return;

        setError("");
        setLoading(true);
        try {
            await login(username, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#07080f",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Ambient Background Glows */}
            <div style={{
                position: "absolute",
                top: "20%",
                left: "30%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
                filter: "blur(40px)",
                zIndex: -1
            }}></div>
            <div style={{
                position: "absolute",
                bottom: "20%",
                right: "30%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
                filter: "blur(40px)",
                zIndex: -1
            }}></div>

            {/* Login Box */}
            <div className="glass" style={{
                width: "100%",
                maxWidth: "420px",
                borderRadius: "var(--radius-lg)",
                padding: "40px 30px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "24px"
            }}>
                {/* Header Logo & Title */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 20px rgba(99,102,241,0.4)"
                    }} className="floating-icon">
                        <Rocket size={24} color="#fff" />
                    </div>
                    <h2 style={{
                        fontFamily: "var(--font-header)",
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        background: "linear-gradient(to right, #fff, #94a3b8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        QuantumTask
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Enter the cosmic workspace
                    </p>
                </div>

                {/* Error Box */}
                {error && (
                    <div style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        padding: "12px",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.85rem",
                        color: "#f87171"
                    }}>
                        <ShieldAlert size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div className="form-group">
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <User size={12} />
                            Username
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            required
                            placeholder="Type username..." 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <KeyRound size={12} />
                            Password
                        </label>
                        <input 
                            type="password" 
                            className="form-input"
                            required
                            placeholder="Type password..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: "100%", height: "45px", marginTop: "10px" }}
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : "Establish Link"}
                    </button>
                </form>

                {/* Google Sign-in segment */}
                {googleClientId && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", margin: "5px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                            <span style={{ height: "1px", background: "rgba(255,255,255,0.06)", flex: 1 }}></span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Or orbit via</span>
                            <span style={{ height: "1px", background: "rgba(255,255,255,0.06)", flex: 1 }}></span>
                        </div>
                        {/* Native Google OAuth Container */}
                        <div id="googleBtn" style={{ display: "flex", justifyContent: "center" }}></div>
                    </div>
                )}

                {/* Footer Switch page */}
                <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    New crew member?{" "}
                    <Link to="/register" style={{ color: "var(--secondary)", fontWeight: 500 }}>
                        Register Cabin
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
