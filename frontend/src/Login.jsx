import React, { useState } from "react";
//get user log in, set user login state, navigate to main interface
const Login = ({ setActiveTab, setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true); 
        setActiveTab("images"); 
      } else {
        console.error("Login failed:", data);
        setError(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login error: Something went wrong. Please try again. " + err.message);
    }
  };
//UI for login plus button for registering an account.
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f0f0"
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        width: "300px"
      }}>
        <h2>Login</h2>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="username">Username:</label><br />
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password">Password:</label><br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <button type="submit" style={{ padding: "8px 16px" }}>
                Login
            </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <p style={{ textAlign: "center" }}>
          Don't have an account? {"   "}
          <button type="button" onClick={() => setActiveTab("register")}>
            Register here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;