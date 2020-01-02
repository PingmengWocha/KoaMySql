const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require("../config/keys");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
const SQL = require("../mysql/index");

//接收传入的passport
module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      let sql = `select * from user where id = '${jwt_payload.id}'`;
      const findResult = await SQL.query(sql)
        .then(res => {
          return res
        })
        .catch(err => {
          console.log(err)
        })
      if (findResult){
        return done(null,findResult)
      } else {
        return done(null,false)
      }
    }));
};
