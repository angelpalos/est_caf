const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'I9fdOsl467op4msy8UjvHjeLM5UswGpQ4jQsuOrn2krxLUUJUaSCXHupxpTTbDaB',
  baseURL: 'http://https://estudiante-cafeteria.up.railway.app//callback',
  clientID: '9tJW8H5eq2MMEsGWvxHZk9bShGXwuHUT',
  issuerBaseURL: 'https://dev-g20uxge5op6jxy12.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});