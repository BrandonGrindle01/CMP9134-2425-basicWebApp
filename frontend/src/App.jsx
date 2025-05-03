import React, { useState, useEffect } from "react";
import "./App.css";
import ImageSearch from "./ImageSearch";
import Login from "./Login";
import Register from "./Register";
import AudioSearch from "./AudioSearch";


function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include"
    });
    setIsLoggedIn(false);
    setActiveTab("login");
  };

  return (
    <>
      {isLoggedIn && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div>
              <button onClick={() => setActiveTab("images")}>Image Search</button>
              <button onClick={() => setActiveTab("audio")}>Audio Search</button>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>

          {activeTab === "images" && <ImageSearch />}
          {activeTab === "audio" && <AudioSearch />}
        </>
      )}
      {activeTab === "login" && (
        <Login setActiveTab={setActiveTab} setIsLoggedIn={setIsLoggedIn} />
      )}

      {activeTab === "register" && (
        <Register setActiveTab={setActiveTab} />
      )}
    </>
  );
}



export default App;
