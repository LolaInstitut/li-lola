import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";
import { auth } from "./firebaseConfig";
import Logout from "./components/Logout/Logout";
import Profile from "./components/Profile/Profile";
import AddBook from "./components/AddBook/AddBook";
import EditBook from "./components/EditBook/EditBook";
import UserBooks from "./components/UserBooks/UserBooks";

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
          <Route path="/addbook" element={<AddBook />} />
          <Route path="/edit-book/:bookId" element={<EditBook />} />
          <Route path="/userbook" element={<UserBooks />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
