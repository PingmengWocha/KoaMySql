const koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
//引入koa-passport 获取用户的token
const passport = require("koa-passport");


const app = new koa();
const router = new Router();

app.use(bodyParser());
//初始化koa-passport
app.use(passport.initialize());
app.use(passport.session());

//回调到config文件中 passport.js
require('./config/passport')(passport);

//引入users.js
const users = require("./routes/api/users");

router.get("/",async ctx => {
  ctx.body = { msg: "Hello Koa Interfaces" }
});

//配置路由地址
router.use("/api/users",users);

//配置路由
app.use(router.routes()).use(router.allowedMethods());

const port = 3000;

app.listen(port, () => {
  console.log(`server started on ${port}`)
});
