import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";
import axios from "axios";
import classes from "./Home.module.css";
import io from "socket.io-client";
import Backend from "./Backend";
const socket = io(`${Backend}`);
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import VoiceToTextInput from "./VoiceToTextInput";

const Home = ({ name, chats, setChats }) => {
  const [room, setRoom] = useState();
  const [submit, setSubmit] = useState(false);
  const [rm, setRm] = useState("");
  const [inputText, setInputText] = useState("");
  const [globalCht, setGlobalCht] = useState([]);

  const chatContainerRef = useRef(null);
  const pageContainerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    if (pageContainerRef.current) {
      pageContainerRef.current.scrollTop =
        pageContainerRef.current.scrollHeight;
    }
  }, [globalCht]);

  useEffect(() => {
    let auth = localStorage.getItem("user");
    if (!auth) {
      navigate("/");
    } else {
      getDatas();
    }
  }, [name]);

  const handleChange = (event) => {
    setRoom(event);
    setSubmit(true);
  };

  const addRoom = async () => {
    if (!rm) {
      return;
    }
    if (chats.includes(rm)) {
      return false;
    }
    const { data } = await axios.post(`${Backend}addChat`, { name, chat: rm });
    setChats(data);
  };

  const deleteRoom = async (index) => {
    let { data } = await axios.post(`${Backend}deleteChat`, { name, index });
    if (data.msg) {
      console.log(data.msg);
      return false;
    }
    setChats(data);
  };

  //code for global chat

  const [user, setUser] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMsg(inputText);
  }, [inputText]);

  const getDatas = () => {
    socket.emit("join_room", { room: "global chat", name });
    socket.on("chat", (data) => {
      setGlobalCht(data);
    });
    socket.on("connected_users", (users) => {
      setUser(users);
    });
  };

  useEffect(() => {
    if (submit) {
      socket.disconnect();
    }
  }, [submit]);

  const sendChat = () => {
    if (!msg) {
      return;
    }
    socket.emit("send_message", {
      msg,
      name,
      room: "global chat",
      chats: globalCht,
    });
    setMsg("");
    setInputText("");
  };

  return (
    <div>
      {!submit && (
        <div ref={pageContainerRef} className={classes.main1}>
          <div className={classes.main2}>
            <div className={classes.addroom}>
              <label htmlFor="room">enter room to add: </label>
              <input
                value={rm}
                onChange={(e) => setRm(e.target.value)}
                type="text"
                name="room"
                placeholder="enter RoomName"
              />
              <button onClick={addRoom}>add</button>
            </div>
            <h3>Your Rooms</h3>
            <ul>
              {chats.map((e, i) => {
                return (
                  <li key={i}>
                    <div className={classes.rooms}>
                      <button
                        className={classes.room}
                        onClick={() => handleChange(e)}
                      >
                        {e}
                      </button>
                      <button
                        className={classes.delroom}
                        onClick={() => deleteRoom(i)}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={classes.main3}>
            <h1>Global Chat</h1>
            <div className={classes.box}>
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                type="text"
                placeholder="enter a chat"
              />
              <button onClick={sendChat}>
                <FontAwesomeIcon icon={faArrowUp} style={{ color: "black" }} />
              </button>
              <VoiceToTextInput
                inputText={inputText}
                setInputText={setInputText}
              />
            </div>
            <ul ref={chatContainerRef} className={classes.container}>
              {globalCht.map((e, i) => {
                return e[0] === name ? (
                  <li className={classes.mechat} key={i}>
                    <div className={classes.name}>{e[0]} </div>
                    <div className={classes.chat}> {e[1]}</div>
                  </li>
                ) : (
                  <li className={classes.elchat} key={i}>
                    <div className={classes.name}>{e[0]} </div>
                    <div className={classes.chat}> {e[1]}</div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={classes.main5}>
            <h3>Online Users</h3>
            <ol>
              {user.map((e, i) => {
                return <li key={i}>{e.name}</li>;
              })}
            </ol>
          </div>
        </div>
      )}
      {submit && <Chat room={room} name={name} />}
    </div>
  );
};

export default Home;
