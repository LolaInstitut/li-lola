import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";
import Book from "./components/Book/Book";
import BookBook from "./components/BookBook/BookBook";
import { getAuth } from "firebase/auth";
import Logout from "./components/Logout/Logout";
import Profile from "./components/Profile/Profile";
import AddBook from "./components/AddBook/AddBook";
import EditBook from "./components/EditBook/EditBook";
import UserBooks from "./components/UserBooks/UserBooks";
import DeleteBook from "./components/DeleteBook/DeleteBook";
import RentedBooks from "./components/RentedBooks/RentedBooks";

const App = () => {
  const [userName, setUserName] = useState("");
  const auth = getAuth();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || user.email.split("@")[0]);
      } else {
        setUserName("");
      }
    });
  }, [auth]);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home name={userName} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home name={userName} />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addbook" element={<AddBook />} />
          <Route path="/edit-book/:bookId" element={<EditBook />} />
          <Route path="/userbook" element={<UserBooks />} />
          <Route path="/book/:bookId" element={<Book />} />
          <Route path="/delete-book/:bookId" element={<DeleteBook />} />
          <Route path="/bookbook/:bookId?" element={<BookBook />} />
          <Route path="/rented-books" element={<RentedBooks />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;