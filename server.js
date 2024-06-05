/* eslint-disable import/order */
/* eslint-disable consistent-return */

const app = require('express')();
const bodyparser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
const authHelper = require('./helper/authHelper');
const { initDb } = require('./database/db');

const port = 8080;
// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(authHelper.checkAuth, (req, res, next) => {
  next();
});
app.use('/', require('./controller/logincontroller'));
app.use('/signup', require('./controller/signupcontroller'));
app.use('/stores',require('./controller/storecontroller'));
app.use('/category',require('./controller/categorycontroller'));
app.use('/users',require('./controller/userscontroller'));
app.use('/roles',require('./controller/rolescontroller'));
app.use('/customers',require('./controller/customerscontroller'));
app.use('/menuitem',require('./controller/menuitemcontroller'));
app.use('/tax',require('./controller/taxcontroller'));
app.use('*', (req, res) => {
  res.status(404).json({
    success: 'false',
    message: 'Page not found',
    error: {
      statusCode: 404,
      message: 'You reached a route that is not defined on this server',
    },
  });
});
app.use((err, req, res, next) => {
  console.error(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
  });
})
initDb().then(() => {
  try {
    app.listen(port, (err) => {
      if (!err) {
        return console.log(`server listening on port ${port}`);
      }
    });
  } catch (err) {
    console.log(err);
  }
});
