import React, { useState } from "react";
//linked to Login, creates an account and links it to the database. hashes passwords for security.
const Register = ({ setActiveTab }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => setActiveTab("login"), 1000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again. " + err.message);
    }
  };
//simple small register ui, provides link back to login.
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f0f0"
    }}>
      <form onSubmit={handleRegister} style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        width: "300px"
      }}>
        <h2>Register</h2>

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
          <label htmlFor="email">Email:</label><br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" style={{ width: "100%", marginBottom: "10px" }}>
          Register
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <p style={{ textAlign: "center" }}>
          Already have an account?{" "}
          <button type="button" onClick={() => setActiveTab("login")}>
            Login here
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;