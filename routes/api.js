const express = require("express");
const router = express.Router();
const { redisQueue } = require("../config/redis");
const { ChatRoom, ChatMessage } = require("../models"); // Import Sequelize models

// Send message
router.post("/send-message", async (req, res) => {
  const { username, room, message } = req.body;

  if (!username || !room || !message) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  const payload = { username, room, message };

  try {
    // Check if record exists in chat_rooms table
    let chatRoom = await ChatRoom.findOne({ where: { username, room } });

    if (!chatRoom) {
      // Create a new record in chat_rooms table if it doesn't exist
      chatRoom = await ChatRoom.create({ username, room, joined_at: new Date() });
    }

    // Enqueue the message into the job queue
    await redisQueue.lPush("job_queue", JSON.stringify(payload));
    console.log("Message enqueued to job queue:", payload);

    // Save the message in MySQL
    await ChatMessage.create({
      username,
      room,
      message,
      sent_at: new Date(),
    });

    res.json({
      status: "Message enqueued and saved successfully",
      data: payload,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error processing your message." });
  }
});

// Fetch messages
router.get("/fetch-messages/:room", async (req, res) => {
  const { room } = req.params;

  if (!room || !room.trim()) {
    return res.status(400).json({ error: "Room is required!" });
  }

  try {
    // Fetch messages from the chat_messages table
    const messages = await ChatMessage.findAll({
      where: { room },
      order: [["sent_at", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
