var db = require('../models');

module.exports = function(app) {
  // Load index page
  app.get('/', function(req, res) {
    db.User.findAll({}).then(function(dbExamples) {
      res.render('index', {
        msg: 'Welcome!',
        examples: dbExamples
      });
    });
  });

  app.get('/profile', function(req, res) {
    db.User.findAll({}).then(function() {
      res.render('profile');
    });
  });

  app.get('/createProfile', function(req, res) {
    console.log(req.cookies);
    let userId = req.cookies['userid'];
    console.log(userId);
    db.User.findAll({ where: { userId: userId}}).then(function(dbUser) {
      console.log('search result' + dbUser[0].dataValues.userName);
      res.render('createProfile', {user: dbUser[0].dataValues});
    });
  });

  // Load example page and pass in an example by id
  app.get('/example/:id', function(req, res) {
    db.User.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
      res.render('example', {
        example: dbExample
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get('*', function(req, res) {
    res.render('404');
  });
};
