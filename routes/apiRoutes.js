const db = require('../models');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mail.somethingborrowed@gmail.com',
        pass: 'yy*V3W336o^I%VlE'
    }
});

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
        const userIdCookie = req.cookies.userid;
        console.log('serverReadCookie' + userIdCookie);
        console.log('verifyResult' + userId);
        if (userIdCookie === userId) {
            res.send({signedIn : true});
        } else {
            db.User.findAll({ where: { userIdToken: userId } }).then(function (pastUser) {
                if (pastUser.length > 0) {
                    res.cookie('userid', userId).send({ registeredUser: userId });
                } else {
                    db.User.create(userInfo).then(function () {
                        res.cookie('userid', userId).send({ newUser: userId });
                    });
                }
            });
        }
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
        const itemInfo = req.body;
        console.log(req.body);
        const userId = req.cookies.userid;
        console.log('userId' + userId);
        const item = {
            itemName: itemInfo.itemName,
            itemImage: itemInfo.itemImage,
            itemDescription: itemInfo.itemDescription,
            itemCategory: itemInfo.itemCategory,
            groupAvailableTo: itemInfo.groupAvailableTo,
            userIdToken: userId
        };
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



    app.post('/api/requests', function (req, res) {
        const requestInfo = req.body;
        console.log(req.body);
        const userId = req.cookies.userid;
        db.Item.findOne({ where: {id: requestInfo.itemId}}).then(function(dbItem) {
            console.log(JSON.stringify(dbItem));
            let itemName = dbItem.itemName;
            const requestObject = {
                owner: dbItem.userIdToken,
                requester: userId, 
                item: requestInfo.itemId,
                itemName: dbItem.itemName,
                duration: requestInfo.duration,
                exchange1: requestInfo.exchange1,
                exchange2: requestInfo.exchange2,
                exchange3: requestInfo.exchange3,
                confirmed: false
            };
            db.itemRequest.create(requestObject).then(function (dbRequest) {
                console.log(JSON.stringify(dbRequest));
                db.User.findOne({where: {userIdToken: dbItem.userIdToken}}).then(function(dbOwner) {
                    let to = dbOwner.userEmail;
                    const mailOptions = {
                        from: 'mail.somethingborrowed@gmail.com',
                        to: to,
                        subject: 'Pending Item Request',
                        text: `Your ${itemName} has been requested. Go to your profile on Something Borrowed to view the request.`,
                        html: `<p>Your ${itemName} has been requested. Click <a href="https://project-2-uwcoding.herokuapp.com/profile">here</a> to go to your profile and view the request.</p>`
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    res.json(dbRequest);
                });
            });
        });
    });

    app.put('/api/requests', function (req, res) {
        let requestId = req.body.requestId;
        let confirmedStatus = req.body.confirmed;
        let deniedStatus = req.body.denied;
        let updatedStatus = {
            confirmed: confirmedStatus,
            denied: deniedStatus,
        };
        db.itemRequest.update(updatedStatus, { where: { id: requestId } }).then(function (dbRequest) {
            if (dbRequest.changedRows === 0) {
                return res.status(404).end();
            }
            db.itemRequest.findOne({where: {id: requestId}}).then(function(dbRequestInfo) {
                let status;
                if (dbRequestInfo.denied === true) {
                    status = 'Denied';
                } else {
                    status = 'Confirmed';
                }
                db.User.findOne({where: {userIdToken: dbRequestInfo.requester}}).then(function(dbRequester) {
                    let to = dbRequester.userEmail;
                    const mailOptions = {
                        from: 'mail.somethingborrowed@gmail.com',
                        to: to,
                        subject: `Item Request ${status}`,
                        text: `Your request to borrow ${dbRequestInfo.itemName} has been ${status.toLowerCase()}.`,
                        html: `<p>Your request to borrow ${dbRequestInfo.itemName} has been ${status.toLowerCase()}</p>`
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    res.status(204).end();
                });
            });
        });
    });

};