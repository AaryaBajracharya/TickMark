function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    req.flash('danger', 'Please log in first.');
    return res.redirect('/admin/login');
  }
  next();
}

module.exports = {
  requireAdmin,
};
