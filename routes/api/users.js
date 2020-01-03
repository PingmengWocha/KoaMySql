const Router = require('koa-router');
const router = new Router();
const SQL = require('../../mysql/index');
const keys = require('../../config/keys');
//引入jsonwebtoken用于生成token
const jwt = require("jsonwebtoken");
//引入passport
const passport = require("koa-passport");

//引入bcryptjs 用于加解密密码
const bcrypt = require('bcryptjs');

//引入验证
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

/**
 * @router GET api/users/test
 * @desc 测试接口
 * @access 公开的接口
 */
router.get("/test",async ctx => {
  ctx.status = 200;
  ctx.body = { msg: "users works..." }
});

/**
 * @router POST api/users/login
 * @desc 用户登录接口
 * @access 公开的接口
 */
router.post("/login",async ctx => {

  //将前端传入的数据进行验证
  const { errors, isValid } = validateLoginInput(ctx.request.body);
  //判断是否验证通过
  if (!isValid){
    ctx.status = 404;
    ctx.body = errors;
    return;
  }

  let data = {
    email: ctx.request.body.email,
    password: ctx.request.body.password
  };

  // console.log(`select * from user where email = '${data.email}' and password = '${data.password}'`)
  //查询数据库
  const findResult = await SQL.query(`select * from user where email = '${data.email}'`)
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    });
  if (findResult.length == 0){
    ctx.status = 404;
    ctx.body = { error: "用户不存在" }
  } else {
    //匹配密码
    let user = findResult[0];
    let result = bcrypt.compareSync(ctx.request.body.password, user.password);
    if (result) {

      const payload = { id: user.id, name: user.name, avatar: user.avatar};
      const token = jwt.sign(payload,keys.secretOrKey,{expiresIn: 3600});

      ctx.status = 200;
      ctx.body = {
        code: 200,
        msg: "",
        data: {
          token: "Bearer " + token,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        } }
    }else {
      ctx.status = 404;
      ctx.body = { error: "密码错误！" }
    }
  }
});

/**
 * @router POST api/users/register
 * @desc 用户注册接口
 * @access 公开的接口
 */
router.post("/register",async ctx => {

  const { errors, isValid } = validateRegisterInput(ctx.request.body);
  if (!isValid){
    ctx.status = 404;
    ctx.body = errors;
    return;
  }

  let data = {
    name: ctx.request.body.name,
    email: ctx.request.body.email,
    avatar: ctx.request.body.avatar,
    password: ctx.request.body.password,
  }
  //首先查询数据库中是否已经存在数据
  const findResult = await SQL.query(`select * from user where email = '${data.email}'`)
    .then(res => {
      return res
    })
    .catch(err => {
      return err
    });

  if (findResult.length != 0){
    ctx.status = 404;
    ctx.body = {code: 400, msg: "邮箱已被注册",data: []}
  } else {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(data.password, salt);
    data.password = hash;
    const sql = `insert into user (name, email, avatar, password) values ('${data.name}','${data.email}','${data.avatar}','${hash}')`;
    const result = await SQL.query(sql)
      .then(res => {
        ctx.body = {code: 200, msg: '', data: data}
      })
      .catch(err => {
        console.log(err)
      })
  }

});

/**
 * @router GET api/users/current
 * @desc 用户信息接口，返回用户的信息
 * @access 私有的接口
 */
router.get("/current",passport.authenticate('jwt', { session: false }),async ctx => {
  ctx.body = {
    id: ctx.state.user[0].id,
    name: ctx.state.user[0].name,
    email: ctx.state.user[0].email,
    avatar: ctx.state.user[0].avatar
  }
});


module.exports = router.routes();
