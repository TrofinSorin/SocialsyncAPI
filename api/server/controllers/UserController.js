import UserService from '../services/UserService';
import Util from '../utils/Utils';

const util = new Util();
const bcrypt = require('bcryptjs');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const allUsers = await UserService.getAllUsers();

      if (allUsers.length > 0) {
        util.setSuccess(200, 'Users retrieved', allUsers);
      } else {
        util.setSuccess(200, 'No book found');
      }
      return util.send(res);
    } catch (error) {
      util.setError(400, error);
      return util.send(res);
    }
  }

  static async addUser(req, res) {
    if (!req.body.username
        || !req.body.password
        || !req.body.confirmpassword
        || !req.body.firstname
        || !req.body.lastname) {
      util.setError(400, 'Please provide complete details');
      return util.send(res);
    }

    const newUser = req.body;
    newUser.password = bcrypt.hashSync(newUser.password);
    newUser.confirmpassword = bcrypt.hashSync(newUser.confirmpassword);

    try {
      const createdUser = UserService.addUser(newUser);

      createdUser.then((response) => {
        util.setSuccess(201, 'User Added!', response);

        return util.send(res);
      });

      return createdUser;
    } catch (error) {
      util.setError(400, error.message);
      return util.send(res);
    }
  }

  static async updatedUser(req, res) {
    const alteredBook = req.body;
    const { id } = req.params;
    if (!Number(id)) {
      util.setError(400, 'Please input a valid numeric value');
      return util.send(res);
    }
    try {
      const updateBook = await UserService.updateBook(id, alteredBook);
      if (!updateBook) {
        util.setError(404, `Cannot find book with the id: ${id}`);
      } else {
        util.setSuccess(200, 'Book updated', updateBook);
      }
      
      return util.send(res);
    } catch (error) {
      util.setError(404, error);
      return util.send(res);
    }
  }

  static async getAUser(req, res) {
    const { id } = req.params;

    if (!Number(id)) {
      util.setError(400, 'User Id is incorect');
      return util.send(res);
    }

    try {
      const theUser = await UserService.getAUser(id);

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

  static async deleteUser(req, res) {
    const { id } = req.params;

    if (!Number(id)) {
      util.setError(400, 'Please provide a numeric value');
      return util.send(res);
    }

    try {
      const bookToDelete = await UserService.deleteBook(id);

      if (bookToDelete) {
        util.setSuccess(200, 'Book deleted');
      } else {
        util.setError(404, `Book with the id ${id} cannot be found`);
      }
      return util.send(res);
    } catch (error) {
      util.setError(400, error);
      return util.send(res);
    }
  }
}

export default UserController;
