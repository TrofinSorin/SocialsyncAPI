import database from '../src/models';

// const { Op } = require('sequelize');
// const moment = require('moment');
const { QueryTypes } = require('sequelize');

class MessageService {
  static async addMessage(message) {
    try {
      return await database.Message.create(message);
    } catch (error) {
      throw error;
    }
  }

  static async getConversationLimit(fromId, toId) {
    try {
      return await database.sequelize.query(`SELECT COUNT(id) from messages WHERE (from_user_id=${fromId} AND to_user_id = ${toId}) OR (from_user_id=${toId} AND to_user_id=${fromId})`, {
        type: QueryTypes.SELECT
      });
    } catch (error) {
      throw error;
    }
  }

  static async getMessagesByFromUser(fromId, toId, page) {
    const limit = page ? page * process.env.MESSAGES_LIMIT : 0;

    try {
      return await database.sequelize.query(`SELECT * from messages WHERE (from_user_id=${fromId} AND to_user_id = ${toId}) OR (from_user_id=${toId} AND to_user_id=${fromId}) ORDER BY created_at DESC LIMIT ${process.env.MESSAGES_LIMIT} OFFSET ${limit}`, {
        type: QueryTypes.SELECT
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateMessage(id, updateUser) {
    try {
      const UserToUpdate = await database.Message.findOne({
        where: { id }
      });

      return UserToUpdate && await database.Message.update(updateUser, { where: { id } });
    } catch (error) {
      throw error;
    }
  }

  static async deleteMessage(id) {
    try {
      const messageToDelete = await database.Message.findOne({ where: { id: Number(id) } });

      if (messageToDelete) {
        const deletedMessage = await database.Message.destroy({
          where: { id: Number(id) }
        });

        return deletedMessage;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}

export default MessageService;
