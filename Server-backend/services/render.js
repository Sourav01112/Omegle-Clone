const axios = require("axios");

exports.homeRoutes = (req, res) => {
  res.render("index");
};
exports.videoChatRoutes = (req, res) => {
  res.render("video-chat");
};
exports.textChatRoutes = (req, res) => {
  res.render("text-chat");
};
