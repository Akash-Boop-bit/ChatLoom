import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import axios from "axios";
import Backend from "./components/Backend";

const App = () => {
  const [name, setName] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    let auth = localStorage.getItem("user");
    if (auth) {
      let id = JSON.parse(auth).id;
      getData(id);
    }
  }, []);

  const getData = async (id) => {
    let { data } = await axios.get(`${Backend}data/${id}`);
    setName(data.name);
    setChats(data.chats);
  };

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home name={name} chats={chats} setChats={setChats} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
