// alert("Hello, Javascript is attached now!");

let localStream;

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
