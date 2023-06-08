//  server.js

const express = require("express");
// Path module will access and manipulate FileSystem
const path = require("path");
require("dotenv").config();
const bodyparser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());

// to use EJS
app.set("view engine", "ejs");

// Using Path module
app.use("/css", express.static(path.resolve(__dirname, "Assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "Assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "Assets/js")));

// Routes
app.use("/", require("./Server-backend/routes/router"));

// Server
var server = app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});

// getting username from Socket to server (passing)
const io = require("socket.io")(server, {
  // to avoid mismatch (false by default)
  allowEIO3: true,
});

// stores all user connection
var userConnection = [];

// receiving username with help of socket.emit
io.on("connection", (socket) => {
  console.log("Socket ID:", socket.id);
  // to listen to the event "userConnect"
  socket.on("userConnect", (data) => {
    console.log("Logged in User", data.displayName);

    //this 'data' holds the info. sent from client Side
    userConnection.push({
      connectionID: socket.id,
      user_id: data.displayName,
    });

    var userCount = userConnection.length;
    // userCount will know how many user are browsing
    console.log("userCount", userCount);
  });
});

// http://localhost:8080/video-chat?username=Sourav%20Chaudhary

/* -- Socket ID: enfVZedgoWXaRwo7AAAB
Logged in User Sourav
userCount 1 
-- Socket ID: vTfMl8qjmAMXw7MUAAAF
Logged in User Sourav Chaudhary
userCount 3
*/

// ********** connected client Side to Server Side here ********* //

/*  Web RTC browser to browser connection : 
 1st. step : sending offer in index.js 
 
 
 */

// index.js

// alert("Hello, Javascript is attached now!");

let peerConnection;
let localStream;
let username;
// getting complete URL
let url = new URL(window.location.href);
username = url.searchParams.get("username");
/* For getting http://localhost:8080/video-chat?username=Sourav */
// alert(username);

// media permission
let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    // below means video and audio will be captured
    video: true,
    audio: true,
  });
  // assigned localStream to user-1 which is local in video-chat.ejs
  document.getElementById("user-1").srcObject = localStream;
};

// init();

// Implementing Socket.IO here

// registering localUser (user-1) to socket
let socket = io.connect();

// sending user info to server
socket.on("connect", () => {
  if (socket.connected) {
    // event name = userConnect
    socket.emit("userConnect", {
      displayName: username,
    });
  }
});

/* 
1st. Step : sending offer to configure webRTC */

let servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};
// ICE servers are used to facilitate the establishment of peer-to-peer connections between clients in real-time applications. The [ stun1.1.google.com:19302 ] and  [ stun2.1.google.com:19302 ] URLs are commonly used Google STUN servers

let createOffer = async () => {
  peerConnection = new RTCPeerConnection(servers);

  let offer = await peerConnection.createOffer();
  // peerConnection will hold the info. of all peer connection for every single user
};
