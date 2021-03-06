/* This is the server file. This file will create an http connection and kickstart 
a socket connection. local port is set to :   http://localhost:3000   */

const express = require("express");
require("dotenv").config();
const socketIO = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

const INDEX = "/index.html";
const DASHBOARD = "public/dashboard.html";
const STUDENT = "public/student.html";
const CHAT = "public/chat.html";
const ADMIN = "public/admin.html";
const ABOUT = "public/about.html";
const ACCOUNT = "public/account.html";
const FORGOT = "public/forgotPass.html";
const MESSAGE = "public/message.html";
const RESET = "public/resetpw.html";
const FEEDBACK_DONE = "public/feedbackDone.html";
const REPLY = "public/reply.html";
const RECOVERY = "public/passwordRecovery.html";

//set up app
let app = express();
let server = app.listen(PORT, () => {
  console.log(`SAFE is running on port ${PORT}`);
});

//calls a module that connects to mongodb
let mongoConnect = require("./public/js/mongoModule.js");
mongoConnect.db();
//call SchemaModule to fill a message model for DB
let Message = require("./public/js/schemaModule.js");

const adminLogin = require("./public/js/login.js");
const users = require("./public/js/createUsers.js");
users.createUsers();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//static files for retrieval. ALL HTML and CSS must go in this folder.
app.use(express.static("public"));

// Use login file to handle posting form information
//app.use("/public/admin", adminLogin);

//Socketio gets passed http server as arg and specifies
let io = socketIO(server, {
  cors: {
    origin: ["https://admin.socket.io"], //permits cross origin of the static chat admin site
  },
});

//connect server to chat admin UI . TODO: NEED TO ENCRYPT
instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2y$12$JMlYelfCXM5t6woezPSxZ.wbPa97DD.Xu2J7eu4lXQN1rURTYI6HO",
  },
});

app.get("/", (req, res) => {
  res.sendFile(INDEX, { root: __dirname });
});

app.get("/student", (req, res) => {
  res.sendFile(STUDENT, { root: __dirname });
});

app.get("/account", (req, res) => {
  res.sendFile(ACCOUNT, { root: __dirname });
});

app.get("/forgot", (req, res) => {
  res.sendFile(FORGOT, { root: __dirname });
});

app.get("/resetPass", (req, res) => {
  res.sendFile(RESET, { root: __dirname });
});

app.get("/chat", (req, res) => {
  res.sendFile(CHAT, { root: __dirname });
});

app.get("/recovery", (req, res) => {
  res.sendFile(RECOVERY, { root: __dirname });
});

app.get("/dashboard", (req, res) => {
  res.sendFile(DASHBOARD, { root: __dirname });
});

app.get("/admin", (req, res) => {
  res.sendFile(ADMIN, { root: __dirname });
});

app.post("/login", (req, res) => {
  // find the email and password in the request
  // since we've added it let's use the body-parser
  // the login function returns a boolean value
  if (adminLogin.login(req.body.email, req.body.password)) {
    res.sendFile(DASHBOARD, { root: __dirname });
  } else {
    res.sendFile(ADMIN, { root: __dirname });
  }
});

app.get("/reply", (req, res) => {
  res.sendFile(REPLY, { root: __dirname });
});

app.get("/about", (req, res) => {
  res.sendFile(ABOUT, { root: __dirname });
});

app.get("/message", (req, res) => {
  res.sendFile(MESSAGE, { root: __dirname });
});

app.get("/feedbackDone", (req, res) => {
  res.sendFile(FEEDBACK_DONE, { root: __dirname });
});

//following app methods are for message.html and DB implementation
app.post("/addMessage", (req, res) => {
  let myData = new Message(req.body);
  myData
    .save()
    .then(() => {
      res.sendFile(FEEDBACK_DONE, { root: __dirname });
    })
    .catch(() => {
      res.status(400).send("Unable to save to database");
    });
});

//socket implementation
io.on("connection", (socket) => {
  console.log("Client connected via socket (not in a room yet)");

  //sends msg to client to test connection
  socket.emit(
    "Msg",
    "Welcome! I am a msg sent from the server to your chat room."
  );

  socket.on("createRoom", function (room) {
    socket.join(room);
    console.log("client joined room " + room + ", ID: " + socket.id);
  });
  //display chat msg on server terminal
  socket.on("chatMsg", (msg) => {
    console.log(msg);
    //emit to everybody
    io.emit("Msg", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    io.emit("Msg", "A user has left the chat");
  });
});

//test emit signal with displaying time display msg sent time
setInterval(() => io.emit("time", new Date().toTimeString()), 1000);
