import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("quantum_token") || null);
    const [loading, setLoading] = useState(true);

    // Verify and fetch profile on load or token change
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    // Token is invalid/expired
                    logout();
                }
            } catch (err) {
                console.error("Error loading user session:", err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    // Native Signup
    const signup = async (username, email, password) => {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");

        localStorage.setItem("quantum_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    // Native Login
    const login = async (username, password) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        localStorage.setItem("quantum_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    // Google Login Callback
    const googleLogin = async (credential) => {
        const res = await fetch("/api/auth/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Google Authentication failed");

        localStorage.setItem("quantum_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("quantum_token");
        setToken(null);
        setUser(null);
    };

    // Update Profile
    const updateProfile = async (profileData) => {
        const res = await fetch("/api/auth/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Update profile failed");

        setUser(data.user);
        return data.user;
    };

    // Global fetch with Auth support
    const apiFetch = async (url, options = {}) => {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, { ...options, headers });
        
        if (res.status === 401) {
            logout();
            throw new Error("Session expired. Please log in again.");
        }

        return res;
    };

    const value = {
        user,
        token,
        loading,
        signup,
        login,
        googleLogin,
        logout,
        updateProfile,
        apiFetch
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
