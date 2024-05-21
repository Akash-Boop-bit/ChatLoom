const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {type: String},
  password: {type: String},
  chats: {type: Array, default: []}
});

module.exports = new mongoose.model("infos", UserSchema);
