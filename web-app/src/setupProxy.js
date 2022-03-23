const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/locations/v1/cities/geoposition/search',
    createProxyMiddleware({
      target: 'http://dataservice.accuweather.com/',
      changeOrigin: true,
    })
  );
  app.use(
    '/api/directions',
    createProxyMiddleware({
      target: 'https://maps.googleapis.com/maps/',
      changeOrigin: true,
    })
  );
  app.use(
    '/currentconditions/v1',
    createProxyMiddleware({
      target: 'http://dataservice.accuweather.com/',
      changeOrigin: true,
    })
  );
};