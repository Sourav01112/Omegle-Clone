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
  // to listen to the event "userConnect" (LOCAL USER)
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
  // http://localhost:8080/video-chat?username=Sourav%20Chaudhary

  /* -- Socket ID: enfVZedgoWXaRwo7AAAB
Logged in User Sourav
userCount 1 
-- Socket ID: vTfMl8qjmAMXw7MUAAAF
Logged in User Sourav Chaudhary
userCount 3
*/
  // ********** connected client Side to Server Side till here ********* //

  /*  Web RTC browser to browser connection : (Remote)
 1st. step : sending offer in index.js */

  // to listen to the event "offerSentToRemote" event (REMOTE USER)

  socket.on("offerSentToRemote", (data) => {
    var offerReceiver = userConnection.find(
      (ele) => ele.user_id === data.remoteUser
    );
    if (offerReceiver) {
      console.log("OfferReceiver user is: ", offerReceiver.connectionID);
      socket.to(offerReceiver.connectionID).emit("ReceiveOffer", data);
    }
  });
  socket.on("answerSentToUser_1", (data) => {
    var answerReceiver = userConnection.find(
      (ele) => ele.user_id === data.receiver
      // this receiver is User-1
    );
    if (answerReceiver) {
      console.log("answerReceiver user is: ", answerReceiver.connectionID);
      socket.to(answerReceiver.connectionID).emit("ReceiveAnswer", data);
    }
  });

  socket.on("candidateSentToUser", (data) => {
    var candidateReceiver = userConnection.find(
      (o) => o.user_id === data.remoteUser
    );
    if (candidateReceiver) {
      console.log(
        "candidateReceiver user is: ",
        candidateReceiver.connectionId
      );
      socket.to(candidateReceiver.connectionId).emit("candidateReceiver", data);
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected");
    var disUser = userConnection.find((ele) => (ele.connectionId = socket.id));
    if (disUser) {
      userConnection = userConnection.filter(
        (ele) => (ele.connectionId = !socket.id)
      );
      console.log(
        "Remaining users username are: ",
        userConnection.map(function (user) {
          return user.user_id;
        })
      );
    }
  });
});
