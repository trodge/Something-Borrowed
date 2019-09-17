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
        if (userIdCookie === userId) {
            res.send({ signedIn: true });
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
        let item = req.body;
        let groupIds = req.body['groupsAvailable[]'];
        let groupIdsInt = groupIds.map(function(item) {
            return parseInt(item);
        });
        console.log(groupIdsInt);
        item.userIdToken = req.cookies.userid;
        db.Item.create(item).then(function (dbResult) {
            dbResult.setGroups(groupIds).then(function(dbGroups) {
                res.json(dbGroups);
            });
        });
    });

    app.post('/api/groups', function (req, res) {
        db.Group.create(req.body).then(group => {
            db.User.findOne({
                where: {
                    userIdToken: req.cookies.userid
                }
            }).then(user => {
                user.addGroup(group, { through: { isAdmin: true } });
                res.json(group);
            }).catch(error => {
                defer.reject(error);
            });
        }).catch(error => {
            defer.reject(error);
        });
    });



    app.post('/api/itemrequests', function (req, res) {
        const requestInfo = req.body;
        console.log(req.body);
        const userId = req.cookies.userid;
        db.Item.findOne({ where: { id: requestInfo.itemId } }).then(function (dbItem) {
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
            db.ItemRequest.create(requestObject).then(function (dbRequest) {
                console.log(JSON.stringify(dbRequest));
                db.User.findOne({ where: { userIdToken: dbItem.userIdToken } }).then(function (dbOwner) {
                    db.User.findOne({ where: { userIdToken: userId } }).then(function (dbRequester) {
                        let to = dbOwner.userEmail;
                        const mailOptions = {
                            from: 'mail.somethingborrowed@gmail.com',
                            to: to,
                            subject: 'Pending Item Request',
                            text: `${dbRequester.userName} has requested your ${itemName}. Go to your profile on Something Borrowed to view the request.`,
                            html: `<p>${dbRequester.userName} has requested your ${itemName}. Click <a href="https://project-2-uwcoding.herokuapp.com/profile">here</a> to go to your profile and view the request.</p>`
                        };
                        transporter.sendMail(mailOptions, function (error, info) {
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
    });

    app.put('/api/itemrequests', function (req, res) {
        let requestId = req.body.requestId;
        let confirmedStatus = req.body.confirmed;
        let deniedStatus = req.body.denied;
        let updatedStatus = {
            confirmed: confirmedStatus,
            denied: deniedStatus,
        };
        db.ItemRequest.update(updatedStatus, { where: { id: requestId } }).then(function (dbRequest) {
            if (dbRequest.changedRows === 0) {
                return res.sendStatus(404);
            }
            db.ItemRequest.findOne({where: {id: requestId}}).then(function(dbRequestInfo) {
                let status;
                if (dbRequestInfo.denied === true) {
                    status = 'denied';
                } else {
                    status = 'confirmed';
                }
                db.User.findOne({where: {userIdToken: dbRequestInfo.requester}}).then(function(dbRequester) {
                    let to = dbRequester.userEmail;
                    const mailOptions = {
                        from: 'mail.somethingborrowed@gmail.com',
                        to: to,
                        subject: `Item Request ${capitalize(status)}`,
                        text: `Your request to borrow ${dbRequestInfo.itemName} has been ${status}.`,
                        html: `<p>Your request to borrow ${dbRequestInfo.itemName} has been ${status}</p>`
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

    app.post('/api/group-requests', (req, res) => {
        db.Group.findOne({ where: { groupId: req.body.groupId } }).then(dbGroup => {
            let groupRequest = {
                groupId: dbGroup.groupId,
                userIdToken: req.cookies.userid
            };
            db.GroupRequest.create(groupRequest).then(dbGroupRequest => {
                dbGroup.getUsers({ through: { isAdmin: true } }).then(function (dbAdministrator) {
                    db.User.findOne({ where: { userIdToken: userId } }).then(function (dbRequester) {
                        let to = dbAdministrator.userEmail;
                        const mailOptions = {
                            from: 'mail.somethingborrowed@gmail.com',
                            to: to,
                            subject: 'Pending Item Request',
                            text: `${dbRequester.userName} has requested to join ${dbGroup.groupName}. Go to your profile on Something Borrowed to view the request.`,
                            html: `<p>${dbRequester.userName} has requested to join ${dbGroup.groupName}. Click <a href="https://project-2-uwcoding.herokuapp.com/profile">here</a> to go to your profile and view the request.</p>`
                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        res.json(dbGroupRequest);
                    });
                });
            });
        });
    });

    app.put('/api/group-requests/:status', (req, res) => {
        db.GroupRequest.update({ status: req.params.status },
            { where: { groupRequestId: req.body.groupRequestId } }).then(dbGroupRequest => {
            dbGroupRequest.getGroup().then(dbGroup => {
                if (!dbGroupRequest.changedRows) {res.sendStatus(404);}
                db.User.findOne({ where: { userIdToken: dbGroupRequest.userIdToken } }).then(dbRequester => {
                    let to = dbRequester.userEmail;
                    const mailOptions = {
                        from: 'mail.somethingborrowed@gmail.com',
                        to: to,
                        subject: `Group Request ${capitalize(req.params.status)}`,
                        text: `Your request to join ${dbGroup.groupName} has been ${req.params.status}.`,
                        html: `<p>Your request to borrow ${dbGroup.groupName} has been ${req.params.status}.</p>`
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    if (req.params.status === 'approved') {
                        dbUser.addGroup(dbGroup);
                    }
                    res.sendStatus('200');
                });
            });
        });
    });
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
