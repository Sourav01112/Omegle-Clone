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
