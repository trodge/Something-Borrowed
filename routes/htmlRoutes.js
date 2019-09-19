const db = require('../models');
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.locals.metaTags = {
            title: 'Something Borrowed',
            description: 'Helping you save money through friend-to-friend lending; don\'t buy when you can borrow!',
            keywords: 'lending, borrow, friend-to-friend, save'
        };
        res.render('index', {
            loggedIn: Boolean(req.cookies.userid)
        });
    });

    app.get('/profile', function (req, res) {
        const userId = req.cookies.userid;
        let administrates = [];
        let belongsTo = [];
        db.User.findOne({ where: { userIdToken: userId }, include: [db.Group, db.Item, db.User] }).then(dbUser => {
            //   console.log('all results 1'+ JSON.stringify(dbUser));
            //   console.log('all results 2'+ JSON.stringify(dbUser.Items));
            //   console.log('all results 3'+ JSON.stringify(dbUser.Groups));
            //   console.log('all results 4'+ JSON.stringify(dbUser.Groups));
            console.log('dbUser.Groups:', dbUser.Groups);
            for (let group of dbUser.Groups) {
                //   console.log(JSON.stringify(dbUser.Groups[j].UserGroup.isAdmin));
                if (group.UserGroup.isAdmin) {
                    administrates.push(group);
                } else {
                    belongsTo.push(group);
                }
            }
            const administratesIds = administrates.map(group => group.groupId);
            const belongsToIds = belongsTo.map(group => group.groupId);
            groupMembers = [];
            db.Group.findAll({
                where: { groupId: administratesIds.concat(belongsToids) },
                include: db.User
            }).then(dbGroup => {
                for (let member of dbGroup.Users) {
                    member.groupId = group.groupId;
                    member.groupName = group.groupName;
                    groupMembers.push(member);
                }
                console.log(groupMembers);
            });
            db.ItemRequest.findAll({ where: { owner: userId } }).then(function (dbRequest) {
                // console.log(JSON.stringify(dbRequest));
                let pendingRequests = [];
                let confirmedRequests = [];
                for (let request of dbRequest) {
                    if (request.dataValues.confirmed === false) {
                        pendingRequests.push(request.dataValues);
                    } else if (request.dataValues.confirmed === true && request.dataValues.denied === false) {
                        confirmedRequests.push(request.dataValues);
                    }
                }
                db.Group.findAll().then(function (dbGroups) {
                    let otherGroups = [];
                    for (let group of dbGroups) {
                        let groupId = group.groupId;
                        if (!administratesIds.includes(groupId) &&
                            !belongsToIds.includes(groupId)) {
                            otherGroups.push(group);
                        }
                    }
                    //what we still need to render profile appropriately: show requests (group name and description) that the user has requested to join and are still pending, show requests to join groups where they are the administrator, show name of person requesting to join
                    db.GroupRequest.findAll({ include: [db.User, db.Group] }).then(function (dbGroupReqests) {
                        let sentGroupReqests = [], recievedGroupRequests = [];
                        for (groupRequest of dbGroupReqests) {
                            groupRequest.requester = groupRequest.User.userName;
                            groupRequest.groupName = groupRequest.Group.groupName;
                            if (groupRequest.userIdToken === userId) { sentGroupReqests.push(groupRequest); }
                            else if (administratesIds.includes(groupRequest.groupId)) { recievedGroupRequests.push(groupRequest); }
                        }
                        res.locals.metaTags = {
                            title: dbUser.userName + '\'s Profile',
                            description: 'See all your items available to borrow and add new items',
                            keywords: 'lending, borrow, friend-to-friend, save, view items, add items'
                        };
                        if (userId) {
                            res.render('profile', {
                                loggedIn: Boolean(userId),
                                user: dbUser,
                                items: dbUser.Items,
                                administrates: administrates,
                                belongsTo: belongsTo,
                                groups: otherGroups,
                                pending: pendingRequests,
                                confirmed: confirmedRequests,
                                sentGroupReuqests: sentGroupReqests,
                                recievedGroupRequests: recievedGroupRequests,
                                groupMembers: groupMembers
                            });
                        } else {
                            res.render('unauthorized', { loggedIn: Boolean(userId), msg: 'You must be signed in to view your profile.' });
                        }
                    });
                });
            });
        });
    });

    app.get('/profile/new', function (req, res) {
        const userId = req.cookies.userid;
        db.User.findAll({ where: { userIdToken: userId } }).then(function (dbUser) {
            res.locals.metaTags = {
                title: 'Create Profile',
                description: 'Complete your new profile so you can save money through friend-to-friend lending',
                keywords: 'lending, borrow, friend-to-friend, save'
            };
            if (userId) {
                res.render('createProfile', {
                    loggedIn: Boolean(userId),
                    user: dbUser[0].dataValues
                });
            } else {
                res.render('unauthorized', { loggedIn: Boolean(userId), msg: 'You must sign in with Google before being able to complete your profile.', user: dbUser[0].dataValues });
            }
        });
    });

    app.get('/items/:category', function (req, res) {
        const userId = req.cookies.userid;
        const selectedCategory = req.params.category;
        let keyCategory = selectedCategory.replace('-', '');
        const categoryNames = {
            all: 'All',
            books: 'Books',
            cleaningsupplies: 'Cleaning Supplies',
            electronics: 'Electronics',
            kitchen: 'Kitchen',
            miscellaneous: 'Miscellaneous',
            moviestv: 'Movies/TV',
            outdoortools: 'Outdoor Tools',
            video: 'Video Games'
        };
        db.User.findOne({ include: db.Group }).then(dbUser => {
            const groupIds = dbUser.Groups.map(group => group.groupId);
            console.log(groupIds);
            db.Group.findAll({
                where: {
                    groupId: groupIds
                }, include: db.Item
            }).then(dbGroups => {
                itemIds = new Set();
                dbItems = [];
                dbGroups.forEach(dbGroup => {
                    dbGroup.Items.forEach(
                        item => {
                            if ((selectedCategory === 'all' || item.itemCategory === selectedCategory) &&
                                !itemIds.has(item.id)) {
                                dbItems.push(item);
                                itemIds.add(item.id);
                            }
                        });
                });
                res.render('items', {
                    category: categoryNames[`${keyCategory}`],
                    loggedIn: Boolean(userId),
                    items: Array.from(dbItems)
                });

            });
        });
    });

    app.get('/search/:query', function (req, res) {
        const userId = req.cookies.userid;
        const searchQuery = req.params.query;
        db.User.findOne({ include: db.Group }).then(dbUser => {
            const groupIds = dbUser.Groups.map(group => group.groupId);
            console.log(groupIds);
            db.Group.findAll({
                where: {
                    groupId: groupIds
                }, include: db.Item
            }).then(dbGroups => {
                console.log(dbGroups);
                itemIds = new Set();
                dbItems = [];
                dbGroups.forEach(dbGroup => {
                    dbGroup.Items.forEach(
                        item => {
                            if ((item.itemName === searchQuery) &&
                                !itemIds.has(item.id)) {
                                dbItems.push(item);
                                itemIds.add(item.id);
                            }
                        });
                });
                res.render('items', {
                    query: searchQuery,
                    loggedIn: Boolean(userId),
                    items: Array.from(dbItems)
                });

            });
        });
    });

    app.get('*', function (req, res) {
        res.locals.metaTags = {
            title: 'Error',
            description: 'Page not found.',
            keywords: 'error'
        };
        res.render('404', { loggedIn: Boolean(req.cookies.userid) });
    });


};
