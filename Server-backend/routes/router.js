const express = require("express");
const route = express.Router();

const services = require("../services/render");

route.get("/", services.homeRoutes);
route.get("/video-chat", services.videoChatRoutes);
route.get("/text-chat", services.textChatRoutes);

module.exports = route;
