//引入validator来检验输入
const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.email)){
    //这里的isEmpty是浏览器提供的方法
    errors.email = "邮箱不能为空"
  }

  if (!Validator.isEmail(data.email)){
    errors.email = "邮箱不合法"
  }

  if (Validator.isEmpty(data.password)){
    errors.password = "密码不能为空"
  }

  if (!Validator.isLength(data.password,{ min: 6, max: 30})) {
    errors.password = "密码的长度在6到30位之间"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }

};
