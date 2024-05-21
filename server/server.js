const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const os = require("os");
require("dotenv").config();
require("./databs/database.js");
const User = require("./databs/Info.js");
const Chat = require("./databs/Chat.js");

const PORT = process.env.PORT || 6600;
const frontend = process.env.FRONTEND;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: frontend,
  },
});

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  let data = await User.find();
  console.log("someone cooonnected");
  res.send(data);
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  let user = await User.findOne({ name: name });
  if (!user) {
    user = new User({ name, password });
    await user.save();
    res.json({ user });
  } else {
    if (password === user.password) {
      res.json({ msg: "success", id: user._id });
    } else {
      res.json({ msg: "wrong password" });
    }
  }
});

app.post("/addChat", async (req, res) => {
  const { name, chat } = req.body;
  const user = await User.findOne({ name });
  //if user exists than start the process
  if (user) {
    //if the chat doesn't exist in the database than create one
    const chatData = await Chat.findOne({ name: chat });
    if (!chatData) {
      let cht = new Chat({ name: chat });
      await cht.save();
    }

    user.chats = [...user.chats, chat];
    await user.save();
    res.json(user.chats);
  } else {
    res.json({ msg: "user not found" });
  }
});

app.post("/deleteChat", async (req, res) => {
  const { name, index } = req.body;
  const user = await User.findOne({ name });
  if (!user) {
    console.log(name, index);
    res.json({ msg: "user not found" });
    return false;
  }
  let cht = user.chats;
  user.chats = cht.filter((_, i) => Number(i) !== Number(index));
  await user.save();
  res.send(user.chats);
});

app.get("/data/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  res.json(user);
});

app.get("/clearChat", async (req, res) => {
  const chat = await Chat.findOne({ name: "global chat" });
  chat.chats = [];
  await chat.save();
  res.json({ msg: "success" });
});

const getUsers = async (room) => {
  try {
    // Fetch all sockets connected to the specified room
    const socketsInRoom = await io.in(room).fetchSockets();

    // Map the sockets to an array of user data (e.g., socket IDs)
    const usersInRoom = socketsInRoom.map((s) => ({
      name: s.name,
      // Add more properties as needed (e.g., username, etc.)
    }));

    // Send the list of users in the room back to the client
    io.to(room).emit("connected_users", usersInRoom);
  } catch (error) {
    console.error(`Failed to fetch sockets in room ${room}:`, error);
  }
};

const sendChat = async (msg, name, room, chats) => {
  let newChat = [...chats, [name, msg]];
  io.to(room).emit("chat", newChat);
  let chatData = await Chat.findOne({ name: room });
  chatData.chats = newChat;
  await chatData.save();
};

const deleteChat = async (index, room, chats) => {
  let newChat = chats.filter((_, i) => i !== index);
  io.to(room).emit("chat", newChat);
  let chatData = await Chat.findOne({ name: room });
  chatData.chats = newChat;
  await chatData.save();
};

io.on("connection", (socket) => {
  socket.on("join_room", async ({ room, name }) => {
    socket.join(room);
    socket.name = name;
    socket.room = room;
    console.log("a user connected:", name, "  and joined room:", room);
    getUsers(room);
    let chats = await Chat.findOne({ name: room });
    if(chats) {
      socket.emit("chat", chats.chats);
    }
  });

  socket.on("send_message", ({ msg, name, room, chats }) => {
    sendChat(msg, name, room, chats);
  });

  socket.on("delete_message", ({ i, room, chats }) => {
    deleteChat(i, room, chats);
  });

  socket.on("leave", async (room) => {
    await socket.leave(room);
    socket.disconnect();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.name);
    getUsers(socket.room);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

