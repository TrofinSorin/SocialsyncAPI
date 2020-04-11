import UserService from '../services/UserService';
import Util from '../utils/Utils';

const util = new Util();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginController {
  static async loginUser(req, res) {
    try {
      const loginUser = await UserService.login(req.body.username);
      const match = await bcrypt.compare(req.body.password, loginUser.password);

      if (match) {
        const expiresIn = 24 * 60 * 60;
        const SECRET_KEY = 'secretkey23456';
        const accessToken = jwt.sign({ id: req.body.id }, SECRET_KEY, { expiresIn });
        loginUser.accessToken = accessToken;
        const userData = {
          userMessage: { accessToken, loginUser }
        };

        console.log('userData:', userData);
        util.setSuccess(200, 'Users retrieved', userData);
      } else {
        util.setError(401, 'User or Password incorect');
      }

      return util.send(res);
    } catch (error) {
      util.setError(400, error);
      return util.send(res);
    }
  }
}

export default LoginController;
