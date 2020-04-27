import database from '../src/models';

const { Op } = require('sequelize');
const moment = require('moment');

class MessageService {
  static async addMessage(message) {
    try {
      return await database.Message.create(message);
    } catch (error) {
      throw error;
    }
  }

  static async getMessagesByFromUser(id) {
    try {
      return await database.Message.findOne({
        where: { id }
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
