const db = require('../models');

module.exports = function (app) {
    //https://developers.google.com/identity/sign-in/web/backend-auth
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client('286476703675-e3k83h6l2h8ohlt381tndsp1ae23k1ic.apps.googleusercontent.com');
    async function verify(token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '286476703675-e3k83h6l2h8ohlt381tndsp1ae23k1ic.apps.googleusercontent.com'
        });
        const payload = ticket.getPayload();
        const verifiedUserId = payload.sub;
        return verifiedUserId;
    }

    app.post('/api/login', async function (req, res) {
        const signIn = req.body;
        const userId = await verify(signIn.token).catch(console.error);
        const userInfo = {
            userIdToken: userId,
            userName: signIn.name,
            userEmail: signIn.email,
            userImage: signIn.image
        };
        db.User.findAll({ where: { userIdToken: userId } }).then(function (pastUser) {
            if (pastUser.length > 0) {
                res.cookie('userid', userId).send({ registeredUser: userId });
            } else {
                db.User.create(userInfo).then(function () {
                    res.cookie('userid', userId).send({ newUser: userId });
                });
            }
        });
    });


    app.put('/api/login', function (req, res) {
        const updatedInfo = req.body;
        const userId = req.cookies.userid;
        db.User.update(updatedInfo, { where: { userIdToken: userId } }).then(function (dbUser) {
            if (dbUser.changedRows === 0) {
                return res.status(404).end();
            }
            res.status(204).end();
        });
    });

    app.post('/api/items', function (req, res) {
        let item = req.body;
        item.userIdToken = req.cookies.userid;
        db.Item.create(item).then(function (dbResult) {
            res.json(dbResult);
        });
    });

    app.post('/api/groups', function (req, res) {
        db.Group.create(req.body).then(group => {
            db.User.findOne({
                where: {
                    userIdToken: req.cookies.userid
                }
            }).then(user => {
                user.addGroup(group, { through: { isAdmin: true }});
                res.json(group);
            }).catch(error => {
                defer.reject(error);
            });
        }).catch(error => {
            defer.reject(error);
        });
    });
};

