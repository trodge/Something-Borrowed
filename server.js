require('dotenv').config();
var express = require('express');
var exphbs = require('express-handlebars');

var db = require('./models'),
  app = express(),
  PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Handlebars
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    helpers: {
      // Function to do basic mathematical operation in handlebar
      math: function(lvalue, operator, rvalue) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
          '+': lvalue + rvalue,
          '-': lvalue - rvalue,
          '*': lvalue * rvalue,
          '/': lvalue / rvalue,
          '%': lvalue % rvalue
        }[operator];
      }
    }
  })
);
app.set('view engine', 'handlebars');

// Routes
require('./routes/apiRoutes')(app);
require('./routes/htmlRoutes')(app);

var syncOptions = { force: false };

/*
 * If running a test, set syncOptions.force to true
 * clearing the `testdb`
 */
if (process.env.NODE_ENV === 'test') {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      '==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.',
      PORT,
      PORT
    );
  });
});

module.exports = app;
