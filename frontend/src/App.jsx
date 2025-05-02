import React, { useState, useEffect } from "react";
import "./App.css";
import ImageSearch from "./ImageSearch";
import Login from "./Login";
import Register from "./Register";


function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {activeTab === 'images' && (
        <div className="images-tab">
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
