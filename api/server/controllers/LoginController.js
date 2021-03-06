import UserService from '../services/UserService';
import Util from '../utils/Utils';

const util = new Util();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const moment = require('moment');

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
        loginUser.lastlogin = Date.now();
        const userData = {
          userMessage: { accessToken, loginUser }
        };

        await UserService.updateUser(loginUser.id, loginUser.dataValues);

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

  static async forgotPassword(req, res) {
    const userDetails = await UserService.forgotPasswordUser(req.body.email);

    async.waterfall([
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          const token = buf.toString('hex');

          done(err, token);
        });
      },
      async (token, done) => {
        if (!userDetails) {
          util.setError(400, 'No account with that email address');

          return;
        }

        userDetails.resetPasswordToken = token;
        userDetails.resetPasswordExpires = moment().add(1, 'hours').format(); // 1 hour

        const updatedUser = await UserService.updateUser(userDetails.id, userDetails.dataValues);

        if (updatedUser) {
          done(null, token, userDetails);
        }
      },
      (token, user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          secure: false, // use SSL
          auth: {
            user: 'socialsync93@gmail.com',
            pass: 'ghnyqhonalumodxa'
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          to: user.username,
          from: 'socialsync93@gmail.com',
          subject: 'SocialSyncs Password Reset',
          text: `${'You are receiving this because you have requested the reset of the password '
          + 'Please click on the following link, or paste this into your browser to complete the process of reseting your password \n'
          + 'http://' + 'localhost:3000' + '/security/set-password/'}${userDetails.id}/${token}`
        };

        smtpTransport.sendMail(mailOptions, (err) => {
          util.setSuccess(200, `An e-mail has been sent to ${user.email} with further instructions`);
          done(err, 'done');
          util.send(res);
        });
      }
    ], (err) => {
      if (err) {
        util.setError(400, err);
        util.send(res);
      }
    });
  }


  static async getTokenValidation(req, res) {
    const { token, id } = req.params;

    try {
      const user = await UserService.getAUserByToken(id, token);

      if (!user) {
        util.setError(401, 'Password reset token is invalid or has expired');
      } else {
        util.setSuccess(200, 'Found User', user);
      }

      return util.send(res);
    } catch (error) {
      util.setError(500, error);

      return util.send(res);
    }
  }

  static async changePassword(req, res) {
    const { token, id } = req.body;

    const user = await UserService.getAUserByToken(id, token);

    if (req.body.password === req.body.confirmpassword) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.password = bcrypt.hashSync(req.body.password);
      user.confirmpassword = bcrypt.hashSync(req.body.confirmpassword);
    } else {
      util.setError(400, 'Password do not match.');

      return;
    }

    async.waterfall([
      async (done) => {
        const updatedUser = await UserService.updateUser(user.id, user.dataValues);

        done(null, updatedUser);
      },
      (userDetails, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          secure: false, // use SSL
          auth: {
            user: 'socialsync93@gmail.com',
            pass: 'ghnyqhonalumodxa'
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          to: user.username,
          from: 'socialsync93@gmail.com',
          subject: 'Your SocialSyncs Password has been Changed',
          text: `Hello!
          This is a confirmation that the password for your account ${user.username} has been changed.`
        };

        console.log('mailOptions', mailOptions);

        smtpTransport.sendMail(mailOptions, (err) => {
          util.setSuccess(200, `An e-mail has been sent to ${user.username}`);
          done(err, 'done');
          util.send(res);
        });
      }
    ], (err) => {
      if (err) {
        util.setError(400, err);
        util.send(res);
      }
    });
  }
}

export default LoginController;
