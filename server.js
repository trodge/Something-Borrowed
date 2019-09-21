require('dotenv').config();
var express = require('express');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');

var db = require('./models');

var app = express();
var PORT = process.env.PORT || 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

// Handlebars
app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/layouts/',
        partialsDir: __dirname + '/views/partials/'
    })
);
app.set('view engine', 'handlebars');

app.locals.googleSignIn = process.env.GOOGLE_SIGN_IN;

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
    });
});

module.exports = app;
