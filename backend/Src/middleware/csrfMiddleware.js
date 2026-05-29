const crypto = require('crypto');

function getCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function isValidCsrfToken(req) {
  const expected = req.session.csrfToken;
  const supplied = req.body._csrf || req.get('x-csrf-token');
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(String(supplied));
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function requireCsrf(req, res, next) {
  if (isValidCsrfToken(req)) return next();
  req.flash('danger', 'Security check failed. Please submit the form again.');
  return res.status(403).render('general/not_found', { title: 'Security check failed' });
}

module.exports = {
  getCsrfToken,
  requireCsrf,
};
