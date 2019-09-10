const db = require('../models');

module.exports = function (app) {
  //https://developers.google.com/identity/sign-in/web/backend-auth
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client("286476703675-e3k83h6l2h8ohlt381tndsp1ae23k1ic.apps.googleusercontent.com");
  async function verify(token) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "286476703675-e3k83h6l2h8ohlt381tndsp1ae23k1ic.apps.googleusercontent.com"
    });
    const payload = ticket.getPayload();
    const verifiedUserId = payload['sub'];
    return verifiedUserId;
  }

  app.post('/api/login', async function (req, res) {
    let signIn = req.body;
    let userId = await verify(signIn.token).catch(console.error);
    let userInfo = {
      userId: userId,
      userName: signIn.name,
      userEmail: signIn.email,
      userImage: signIn.image
    }
    db.User.findAll({ where: { userId: userId } }).then(function (pastUser) {
      if (pastUser.length > 0) {
        res.cookie("userid", userId).send({ registeredUser: userId });
      } else {
        db.User.create(userInfo).then(function() {
          res.cookie("userid", userId).send({ newUser: userId });
        });
      }
    });
  });
};


  // app.post('/api/createProfileInfo', function (req, res) {
  //   console.log()
  // });

  // app.post('/api/profile', async function (req, res) {
  //   console.log(req.body);
  //   let userId = await verify(req.body.token).catch(console.error);

  //   db.User.findAll({ where: { userId: userId} }).then(function(pastUser) {
  //     console.log(pastUser);
  //     if (pastUser.length > 0) {
  //       res.send('registeredUser');
  //     } else {
  //       res.send('newUser');
  //     }
  // })});


  // // Get all examples
  // app.get('/api/examples', function(req, res) {
  //   db.Example.findAll({}).then(function(dbExamples) {
  //     res.json(dbExamples);
  //   });
  // });

  // // Create a new example
  // app.post('/api/examples', function(req, res) {
  //   db.Example.create(req.body).then(function(dbExample) {
  //     res.json(dbExample);
  //   });
  // });

  // // Delete an example by id
  // app.delete('/api/examples/:id', function(req, res) {
  //   db.Example.destroy({ where: { id: req.params.id } }).then(function(
  //     dbExample
  //   ) {
  //     res.json(dbExample);
  //   });
  // });

