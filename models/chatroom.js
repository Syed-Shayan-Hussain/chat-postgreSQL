'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }
  ChatRoom.init(
    {
      username: DataTypes.STRING,
      room: DataTypes.STRING,
      joined_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'ChatRoom',
    }
  );
  return ChatRoom;
};
