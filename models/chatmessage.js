'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  ChatMessage.init(
    {
      username: DataTypes.STRING,
      room: DataTypes.STRING,
      message: DataTypes.TEXT,
      sent_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'ChatMessage',
    }
  );
  return ChatMessage;
};
