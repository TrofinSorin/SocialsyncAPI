import database from '../src/models';

const { Op } = require('sequelize');
const moment = require('moment');

class UserService {
  static async getAllUsers() {
    try {
      return await database.User.findAll();
    } catch (error) {
      throw error;
    }
  }

  static async addUser(newUser) {
    try {
      return await database.User.create(newUser);
    } catch (error) {
      throw error;
    }
  }

  static async login(user) {
    try {
      return await database.User.findOne({
        where: { username: user }
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id, updateUser) {
    try {
      const UserToUpdate = await database.User.findOne({
        where: { id }
      });

      return UserToUpdate && await database.User.update(updateUser, { where: { id } });
    } catch (error) {
      throw error;
    }
  }

  static async getAUserByToken(id, resetPasswordToken) {
    try {
      const theUser = await database.User.findOne({
        where: { id, resetPasswordToken, resetPasswordExpires: { [Op.gt]: moment().format() } }
      });

      return theUser;
    } catch (error) {
      throw error;
    }
  }

  static async getAUser(id) {
    try {
      const theUser = await database.User.findOne({
        where: { id }
      });

      return theUser;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const UserToDelete = await database.User.findOne({ where: { id: Number(id) } });

      if (UserToDelete) {
        const deletedUser = await database.User.destroy({
          where: { id: Number(id) }
        });
        return deletedUser;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async forgotPasswordUser(username) {
    try {
      const theUser = await database.User.findOne({
        where: { username }
      });

      return theUser;
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
