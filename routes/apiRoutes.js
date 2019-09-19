const db = require('../models');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_ADDRESS,
        pass: process.env.MAILER_PASSWORD
    }
});

module.exports = function (app) {
    const profileLink = "https://something--borrowed.herokuapp.com/profile";
    //https://developers.google.com/identity/sign-in/web/backend-auth
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_SIGN_IN);
    async function verify(token) {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_SIGN_IN
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
        console.log('POST to /api/items body: ' + JSON.stringify(req.body));
        let groupIds = req.body.groupsAvailable;
        let groupIdsInt;
        if (Array.isArray(groupIds))
        {groupIdsInt = groupIds.map(i => parseInt(i));}
        else
        {groupIdsInt = [parseInt(groupIds)];}
        console.log(groupIdsInt);
        item.userIdToken = req.cookies.userid;
        db.Item.create(item).then(dbItem =>
            dbItem.setGroups(groupIdsInt).then(dbGroups => res.json(dbGroups))
                .catch(err => res.json(err))
        ).catch(err => res.json(err));
    });

    app.post('/api/groups', function (req, res) {
        db.Group.create(req.body).then(group =>
            db.User.findOne({
                where: {
                    userIdToken: req.cookies.userid
                }
            }).then(user =>
                user.addGroup(group, { through: { isAdmin: true } }).then(dbGroup => res.json(dbGroup))
            ).catch(err => res.json(err))
        ).catch(err => res.json(err));
    });

    app.put('/api/remove-member/:groupid', (req, res) => {
        console.log(req.params);
        console.log(req.body);
        db.Group.findOne({
            where: { groupId: req.params.groupid }, include: {
                model: db.User, where: { userIdToken: req.body.userid }
            }
        }).then(dbGroup =>
            dbGroup.removeUser(dbGroup.User)).then(dbResult => res.json(dbResult));
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
                            from: process.env.MAILER_ADDRESS,
                            to: to,
                            subject: 'Pending Item Request',
                            text: `${dbRequester.userName} has requested your ${itemName}. Go to your profile on Something Borrowed to view the request.`,
                            html: `<p>${dbRequester.userName} has requested your ${itemName}. Click <a href="${profileLink}">here</a> to go to your profile and view the request.</p>`
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
            db.ItemRequest.findOne({ where: { id: requestId } }).then(function (dbRequestInfo) {
                let status;
                if (dbRequestInfo.denied === true) {
                    status = 'denied';
                } else {
                    status = 'confirmed';
                }
                db.User.findOne({ where: { userIdToken: dbRequestInfo.requester } }).then(function (dbRequester) {
                    let to = dbRequester.userEmail;
                    const mailOptions = {
                        from: process.env.MAILER_ADDRESS,
                        to: to,
                        subject: `Item Request ${capitalize(status)}`,
                        text: `Your request to borrow ${dbRequestInfo.itemName} has been ${status}.`,
                        html: `<p>Your request to borrow ${dbRequestInfo.itemName} has been ${status}</p>`
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    res.sendStatus(204);
                });
            });
        });
    });

    app.post('/api/group-request', (req, res) => {
        db.Group.findOne({ where: { groupId: req.body.groupId } }).then(dbGroup => {
            let groupRequest = {
                groupId: dbGroup.groupId,
                userIdToken: req.cookies.userid,
                status: 'pending'
            };
            console.log('dbGroup ' + JSON.stringify(dbGroup));
            db.GroupRequest.create(groupRequest).then(dbGroupRequest => {
                dbGroup.getUsers({ through: { isAdmin: true } }).then(function (dbAdministrator) {
                    console.log('dbAdministrator ' + JSON.stringify(dbAdministrator));
                    db.User.findOne({ where: { userIdToken: req.cookies.userid } }).then(function (dbRequester) {
                        console.log('dbRequester ' + JSON.stringify(dbRequester));
                        let to = dbAdministrator[0].userEmail;
                        const mailOptions = {
                            from: process.env.MAILER_ADDRESS,
                            to: to,
                            subject: 'Pending Group Request',
                            text: `${dbRequester.userName} has requested to join ${dbGroup.groupName}. Go to your profile on Something Borrowed to view the request.`,
                            html: `<p>${dbRequester.userName} has requested to join ${dbGroup.groupName}. Click <a href="${profileLink}">here</a> to go to your profile and view the request.</p>`
                        };
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        console.log('dbGroupRequest ' + JSON.stringify(dbGroupRequest));
                        res.json(dbGroupRequest);
                    });
                });
            });
        });
    });

    app.delete('/api/group-request/:status', (req, res) => {
        const groupRequestId = req.body.groupRequestId;
        db.GroupRequest.findOne({
            where: {
                groupRequestId: groupRequestId
            },
            include: [db.Group, db.User]
        }).then(dbGroupRequest => {
            const dbGroup = dbGroupRequest.Group;
            const groupName = Group.groupName;
            const dbUser = dbGroupRequest.User;
            const to = dbUser.userEmail;
            const status = req.params.status;
            const mailOptions = {
                from: process.env.MAILER_ADDRESS,
                to: to,
                subject: `Group Request ${capitalize(status)}`,
                text: `Your request to join ${groupName} has been ${status}.`,
                html: `<p>Your request to join ${groupName} has been ${status}.</p>`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error)
                {console.log(error);}
                else
                {console.log('Email sent: ' + info.response);}
                db.GroupRequest.destroy({ where: { groupRequestId: groupRequestId } }).then(() => {
                    if (status === 'approved') {
                        dbGroup.addUser(dbUser).then();
                    } else
                    {res.sendStatus('200');}
                });
            });
        });
    });
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
