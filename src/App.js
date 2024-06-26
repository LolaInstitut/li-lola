import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";
import { auth } from "./firebaseConfig";
import Logout from "./components/Logout/Logout";
import Profile from "./components/Profile/Profile";

const App = () => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
      } else setUserName("");
    });
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home name={userName} />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>

      <div className="header">
        <h1>Biblioteka</h1>

      </div>
      <p></p>
      <div className="content">
        {/* Vaš glavni sadržaj ide ovde */}
        {/* Dodajemo input polje za pretragu */}
        <input type="text" placeholder="Pretraži knjige" />
      </div>
      <footer className="footer">
        Autorsko pravo © Lola institut d.o.o. 2023. Sva prava zadržana.
      </footer>
    </div>
  );
};

export default App;
