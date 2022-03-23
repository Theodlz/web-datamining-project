const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api/directions',
    createProxyMiddleware({
      target: 'https://maps.googleapis.com/maps/',
      changeOrigin: true,
    })
  );
};