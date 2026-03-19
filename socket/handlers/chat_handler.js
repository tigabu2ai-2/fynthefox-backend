const chatService = require("../../services/chat_service");
const complaintService = require("../../services/complaint_service");

const room = (id) => `complaint:${id}`;

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_complaint_chat", async ({ complaint_id }) => {
      //   const complaint = await complaintService.fetchComplaintDetailInfo(complaint_id);
      //   if(!complaint) return;

      if (
        !complaintService.canAccessComplaintChat(
          socket.user.id,
          socket.user.role,
          complaint_id,
        )
      )
        return;

      socket.join(room(complaint_id));
    });

    socket.on("send_message", async ({ complaint_id, message }) => {
      if (!message || !message.trim()) return;

      if (
        !complaintService.canAccessComplaintChat(
          socket.user.id,
          socket.user.role,
          complaint_id,
        )
      )
        return;

      const complaint =
        await complaintService.fetchComplaintDetailInfo(complaint_id);
      if (!complaint) return;

      const saved = await chatService.saveMessage(
        complaint_id,
        socket.user.role,
        socket.user.id,
        message,
      );

      io.to(room(complaint_id)).emit("new_message", saved);
    });
  });
};
