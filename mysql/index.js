//cnpm install mysql-pro --save用来创建数据库连接池
const Client = require("mysql-pro");

const client = new Client({
  mysql: {
    host:       "localhost",
    port:        3306,
    database:   "koatest",
    user:       "root",
    password:   "143210"
  }
});

module.exports = client;
