const { Server } = require("socket.io");

const registerChatHandlers = require("./handlers/chat_handler");
const authenticateSocket = require("./authenticate_access_token");
const initializeRedisAdapter = require("./redis_adapter");
module.exports = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.use(authenticateSocket);

  await initializeRedisAdapter(io);
  registerChatHandlers(io);

  return io;
};
