const passport = require('passport')
const cryto = require('crypto')
const mongoose = require('mongoose')
const promisify = require('es6-promisify')
const mail = require('../handlers/mail')
const User = mongoose.model('User')

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed to login',
  successRedirect: '/',
  successFlash: 'You are now logged in'
})

exports.logout = (req, res) => {
  req.logout()
  req.flash('success', 'You have now logged out')
  res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.flash('error', 'You need to be logged in')
    return res.redirect('/login')
  }
}

exports.forgot = async (req, res) => {
  const user = await User.findOne({email: req.body.email})

  if (!user) {
    req.flash('error', 'No user exists')
  }

  user.resetPasswordToken = cryto.randomBytes(20).toString('hex')
  user.resetPasswordDate = Date.now() + 36000000
  await user.save()

  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`

  await mail.send({
    user,
    subject: 'Password Reset',
    resetUrl,
    filename: 'password-reset'
  })
  req.flash('success', `You have been emailed a token.`)
  res.redirect('/login')
}

exports.checkResetToken = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordDate: { $gt: Date.now() }
  })

  if (!user) {
    req.flash('error', 'Password reset has expired')
    res.redirect('/login')
  } else {
    req.user = user
    next()
  }
}

exports.reset = async (req, res) => {
  res.render('reset', { title: 'Reset your password' })
}

exports.confirmedPasswords = (req, res, next) => {
  req.checkBody('password', 'You must provide an email').notEmpty()
  req.checkBody('password-confirm', 'Emails do not match').equals(req.body.password)
  const errors = req.validationErrors()
  if (errors) {
    req.flash('error', errors.map(err => err.msg))
    res.redirect('back')
  }

  next()
}

exports.update = async(req, res) => {
  const user = req.user
  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password)
  user.resetPasswordToken = undefined
  user.resetPasswordDate = undefined

  const updatedUser = await user.save()

  await req.login(updatedUser)
  req.flash('success', 'Password reset successfully')
  res.redirect('/')
}
