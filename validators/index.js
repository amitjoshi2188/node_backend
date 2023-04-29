//* validators/index.js
const register = require('./register.validator')
const login = require('./login.validator')
const category = require('./category.validator')
const user = require('./user.validator')

module.exports = {
    register,
    login,
    category,
    user,
}