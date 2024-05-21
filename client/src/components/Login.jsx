import React, { useEffect, useState } from "react";
import axios from "axios";
import Backend from "./Backend";
import { useNavigate } from "react-router-dom";
import classes from "./Login.module.css";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [btn, setBtn] = useState("Submit");
  const [pass, setPass] = useState();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let auth = localStorage.getItem("user");
    if (auth) {
      navigate("/home");
    }
  }, []);

  const loginHandler = async () => {
    if (!name || !password) {
      setError(true);
      return false;
    }
    setBtn("loading");

    const { data } = await axios.post(`${Backend}login`, { name, password });

    if (data.msg === "wrong password") {
      setBtn("Submit");
      setPass("Wrong Password");
      return false;
    }
    if (data.msg === "success") {
      let auth = localStorage.setItem(
        "user",
        JSON.stringify({ name, id: data.id })
      );
      // navigate('/home')
      window.location.reload();
      return false;
    }
    let auth = localStorage.setItem(
      "user",
      JSON.stringify({ name, id: data.user._id })
    );
    window.location.reload();
    setBtn("Submit");
  };

  return (
    <div className={classes.main}>
      <div className={classes.main1}>
        <h1>Login</h1>
        <h4>Note: please use a unique username to create new acc.</h4>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Enter your Username"
        />
        {error && !name && <p>Please enter a Name</p>}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter your Password"
        />
        {error && !password && <p>Please enter a password</p>}
        {pass && <p>{pass}<br></br>(this username already exists and the password you entered is wrong.)</p>}
        <button onClick={loginHandler}>{btn}</button>
      </div>
    </div>
  );
};

export default Login;
