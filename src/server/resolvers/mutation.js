
import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';

const SALT_ROUNDS = 10;

export default {
    login: async (obj, {username, password}, {res}) => {
      let user = await User.findOne({username});
      if(user && bcrypt.compareSync(password, user.password)){
          const accessToken = jwt.sign({userId: user._id}, process.env['ACCESS_TOKEN_SECRET'], {expiresIn: '15min'});
          const refreshToken = jwt.sign({version: uuidv4()}, process.env['REFRESH_TOKEN_SECRET'], {expiresIn: '7d'});
          // expires after 15 min
          res.cookie('accessToken', accessToken, {expires: new Date(Date.now() + 1000 * 60 * 15)});
          // expires after 24 hours
          res.cookie('refreshToken', refreshToken, {expires: new Date(Date.now() + 1000 * 60 * 60 * 24)});
          return "success";
      }
        return "failure";
    },
    register: async (obj, {email, username, password}, context) => {
        password = bcrypt.hashSync(password, SALT_ROUNDS);
        return await User.create({email, username, password});
    }
}