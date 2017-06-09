const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const validator = require('validator')
const md5 = require('md5')
const mongodbErrorHandler = require('mongoose-mongodb-errors')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: 'Please enter an email',
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid email address']
  },
  name: {
    type: String,
    trim: true,
    required: 'Please enter a name'
  }
})

userSchema.plugin(passportLocalMongoose, { usernameField: 'email'})
userSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model('User', userSchema)

