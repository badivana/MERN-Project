import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Rocket, ShieldAlert, KeyRound, User, Mail } from "lucide-react";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError("Username and Password are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setLoading(true);
        try {
            await signup(username, email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Registration failed");
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

            {/* Register Box */}
            <div className="glass" style={{
                width: "100%",
                maxWidth: "420px",
                borderRadius: "var(--radius-lg)",
                padding: "35px 30px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}>
                {/* Header Logo & Title */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
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
                        Initialize Cabin
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Deploy your productivity profile
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

                {/* Registration Form */}
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <User size={12} />
                            Username
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            required
                            placeholder="Min 3 characters" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Mail size={12} />
                            Email Address (Optional)
                        </label>
                        <input 
                            type="email" 
                            className="form-input"
                            placeholder="pilot@quantum.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <KeyRound size={12} />
                            Password
                        </label>
                        <input 
                            type="password" 
                            className="form-input"
                            required
                            placeholder="Secure code..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <KeyRound size={12} />
                            Confirm Password
                        </label>
                        <input 
                            type="password" 
                            className="form-input"
                            required
                            placeholder="Re-enter password..." 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        style={{ width: "100%", height: "45px", marginTop: "10px" }}
                        disabled={loading}
                    >
                        {loading ? "Launching Cabin..." : "Register Cabin"}
                    </button>
                </form>

                {/* Footer Switch page */}
                <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Already have a cabin?{" "}
                    <Link to="/login" style={{ color: "var(--secondary)", fontWeight: 500 }}>
                        Login Link
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
