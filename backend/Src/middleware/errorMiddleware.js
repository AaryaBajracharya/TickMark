function notFoundMiddleware(req, res) {
  res.status(404).render('general/not_found', { title: 'Page not found' });
}

function errorMiddleware(error, req, res, next) {
  console.error(error);
  res.status(500).render('general/not_found', { title: 'Something went wrong', detail: error.message });
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
