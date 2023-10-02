const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

router
  .route('/register')
  .get((req, res) => {
    res.render('users/register');
  })
  .post(catchAsync(users.register));

router
  .route('/login')
  .get((req, res) => {
    res.render('users/login');
  })
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
      session: true,
      keepSessionInfo: true,
    }),
    users.login
  );

router.get('/logout', users.logout);

module.exports = router;
