import MessageService from '../services/MessageService';
import Util from '../utils/Utils';

const util = new Util();

class MessageController {
  static async getMessagesByUser(req, res) {
    const { id } = req.body;

    try {
      const allUsers = await MessageService.getMessagesByFromUser(id);

      util.setSuccess(200, '', allUsers);

      return util.send(res);
    } catch (error) {
      util.setError(400, error);
      return util.send(res);
    }
  }

  static async addMesage(req, res) {
    const data = req.body;

    try {
      const createdMessage = MessageService.addMessage(data);

      createdMessage.then((response) => {
        util.setSuccess(201, '', response);

        return util.send(res);
      });

      return createdMessage;
    } catch (error) {
      util.setError(400, error.message);
      return util.send(res);
    }
  }

  static async updateMessage(req, res) {
    const messageData = req.body;
    const { id } = req.params;

    try {
      const updatedMessage = await MessageService.updateMessage(id, messageData);
      if (!updatedMessage) {
        util.setError(404, `Cannot find message with the id: ${id}`);
      } else {
        util.setSuccess(200, '', updatedMessage);
      }

      return util.send(res);
    } catch (error) {
      util.setError(404, error);
      return util.send(res);
    }
  }

  static async getAMessage(req, res) {
    const { id } = req.params;

    if (!Number(id)) {
      util.setError(400, 'Message Id is incorect');
      return util.send(res);
    }

    try {
      const theUser = await MessageService.getAUser(id);

      if (!theUser) {
        util.setError(404, `Cannot find user with ${id}`);
      } else {
        util.setSuccess(200, 'Found User', theUser);
      }

      return util.send(res);
    } catch (error) {
      util.setError(404, error);
      return util.send(res);
    }
  }

  static async deleteMessage(req, res) {
    const { id } = req.params;

    if (!Number(id)) {
      util.setError(400, 'Please provide a numeric value');
      return util.send(res);
    }

    try {
      const messageToDelete = await MessageService.deleteMessage(id);

      if (messageToDelete) {
        util.setSuccess(200, 'Message deleted');
      } else {
        util.setError(404, `Message with the id ${id} cannot be found`);
      }
      return util.send(res);
    } catch (error) {
      util.setError(400, error);
      return util.send(res);
    }
  }
}

export default MessageController;
