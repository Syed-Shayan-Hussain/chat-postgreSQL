const { redisQueue } = require("../config/redis");
const db = require("../config/database"); // Sequelize instance
const { ChatRoom, ChatMessage } = require("../models"); // Import Sequelize models

const connectedUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", async ({ username, room }) => {
      connectedUsers[socket.id] = { username, room };
      socket.join(room);
      console.log(`${username} joined room: ${room}`);

      try {
        // Save the room joining info in the database
        await ChatRoom.create({
          username,
          room,
          joined_at: new Date(),
        });

        // Fetch previous messages for the room and emit them to the user
        const messages = await ChatMessage.findAll({
          where: { room },
          attributes: ["username", "message", "sent_at"],
          order: [["sent_at", "ASC"]],
        });

        socket.emit("previousMessages", messages);
      } catch (error) {
        console.error("Error handling room join:", error.message);
      }
    });

    socket.on("sendMessage", async ({ username, room, message }) => {
      const payload = { username, room, message };

      // Enqueue the message into the job queue
      await redisQueue.lPush("job_queue", JSON.stringify(payload));
      console.log("Message enqueued to job queue:", payload);

      // Save the message in the database
      try {
        await ChatMessage.create({
          username,
          room,
          message,
          sent_at: new Date(),
        });
      } catch (error) {
        console.error("Error saving message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      delete connectedUsers[socket.id];
      console.log("User disconnected:", socket.id);
    });
  });
};
