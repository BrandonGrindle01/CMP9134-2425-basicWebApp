import React, { useState, useEffect } from "react";
import "./App.css";
import ImageSearch from "./ImageSearch";
import Login from "./Login";
import Register from "./Register";


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
      {isLoggedIn && activeTab === 'images' && (
        <div className="images-tab">
          {/* 🔘 Add logout button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <ImageSearch />
        </div>
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
