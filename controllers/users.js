const User = require('../models/user');

module.exports.register = async (req, res, next) => {
  try {
    console.log('im here');
    const { email, username, password } = req.body;
    const user = new User({
      email,
      username,
    });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', `${username}, Welcome to YelpCamp!`);
      res.redirect('/campgrounds');
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/register');
  }
};

module.exports.login = (req, res) => {
  req.flash('success', `${req.body.username}, Welcome Back!`);
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Goodbye, Hope to see you soon!');
    res.redirect('/campgrounds');
  });
};
