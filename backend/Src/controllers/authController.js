const config = require('../config/env');

function loginPage(req, res) {
  res.render('admin/admin_login');
}

function login(req, res) {
  if (req.body.username === config.adminUsername && req.body.password === config.adminPassword) {
    req.session.admin = true;
    return res.redirect('/admin');
  }
  req.flash('danger', 'Invalid credentials');
  res.redirect('/admin/login');
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/'));
}

module.exports = {
  loginPage,
  login,
  logout,
};
