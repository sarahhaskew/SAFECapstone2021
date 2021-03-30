/* This is the server file. This file will create an http connection and kickstart 
a socket connection. local port is set to :   http://localhost:3000   */

const express = require("express");
const socketIO = require("socket.io");
const PORT = process.env.PORT || 3000;

const INDEX = "/index.html";
const STUDENT = "public/student.html";
const ADMIN = "public/admin.html";
const ABOUT = "public/about.html";
const MESSAGE = "public/message.html";

//set up app
var app = express();
var server = app.listen(PORT, () => {
  console.log(`SAFE is running on port ${PORT}`);
});

//static files for retrieval. ALL HTML and CSS must go in this folder.
app.use(express.static("public"));

//pass the socket a server. "I want socketio to work on this server"
var io = socketIO(server);

app.get("/", (req, res) => {
  res.sendFile(INDEX, { root: __dirname });
});

app.get("/student", (req, res) => {
  res.sendFile(STUDENT, { root: __dirname });
});

app.get("/admin", (req, res) => {
  res.sendFile(ADMIN, { root: __dirname });
});

app.get("/about", (req, res) => {
  res.sendFile(ABOUT, { root: __dirname });
});

app.get("/message", (req, res) => {
  res.sendFile(MESSAGE, { root: __dirname });
});

io.on("connection", (socket) => {
  console.log("Client connected via socket (not in a room yet)");
  socket.emit('Msg', 'welcome');
  socket.on("createRoom", function (room) {
    socket.join(room);
    console.log("client joined room " + room + ", ID: " + socket.id);
  });
  socket.on( "chatMsg", function(msg){

  })
  socket.on("disconnect", () => console.log("Client disconnected"));
});

//test emit signal with displaying time
setInterval(() => io.emit("time", new Date().toTimeString()), 1000);
