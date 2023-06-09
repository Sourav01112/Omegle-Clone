// alert("Hello, Javascript is attached now!");

let peerConnection;
let localStream;
let username;
let remoteUser;
let remoteStream;
// getting complete URL
let url = new URL(window.location.href);
username = url.searchParams.get("username");
remoteUser = url.searchParams.get("remoteuser");
/* For getting http://localhost:8080/video-chat?username=Sourav */
/* http://localhost:8080/video-chat?username=Sourav%20Chaudhary&remoteuser=Germany */
// alert(username);

// **** to start the Media
init();

// media permission
let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    // below means video and audio will be captured
    video: true,
    audio: true,
  });
  // assigned localStream to user-1 which is local in video-chat.ejs
  document.getElementById("user-1").srcObject = localStream;
  createOffer();
};

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

let createPeerConnection = async () => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();

  document.getElementById("user-2").srcObject = remoteStream;
  localStream.getTrack().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  // listen the change
  // firing event
  peerConnection.ontrack = async (e) => {
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // to manage the inactivity (if connection is closed)
  remoteStream.oninactive = () => {
    remoteStream.getTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    // closing all the connection : while inactivity
    peerConnection.close();
  };

  peerConnection.onicecandidate = async (e) => {
    if (e.candidate) {
      socket.emit("candidateSentToUser", {
        username: username,
        remoteUser: remoteUser,
        iceCandidateData: e.candidate,
      });
    }
  };
};

let createOffer = async () => {
  peerConnection = new RTCPeerConnection(servers);

  let offer = await peerConnection.createOffer();
  // peerConnection will hold the info. of all peer connection for every single user
  await peerConnection.setLocalDescription(offer);
  socket.emit("offerSentToRemote", {
    username: username, // local User : Sourav
    remoteUser: remoteUser,
    offer: peerConnection.localDescription,
  });
};

// Will be triggered for the Remote User Client Side
let createAnswer = async (data) => {
  remoteUser = data.username;
  peerConnection = new RTCPeerConnection(servers);
  // this will remote Description for User-2
  await peerConnection.setRemoteDescription(data.offer);
  let answer = await peerConnection.createAnswer();

  // send the user-1 answer to receive as remote description from user-2
  socket.emit("answerSentToUser_1", {
    answer: answer,
    sender: data.remoteUser,
    receiver: data.username, // user-1
  });
};

socket.on("ReceiveOffer", function (data) {
  createAnswer(data);
});

let addAnswer = async (data) => {
  if (!peerConnection.currentRemoteDescription) {
    // if there is no remote desc. in peer connection yet, then only set the set the answer as remoteDesc. for User-1
    peerConnection.setRemoteDescription(data.answer);
  }
};

socket.on("ReceiveAnswer", function (data) {
  addAnswer(data);
});
