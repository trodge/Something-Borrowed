const db = require('../models');
module.exports = function (app) {
    // let currentCategories = [];

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
        db.User.findOne({ where: { userIdToken: userId }, include: [db.Group, db.Item] }).then(dbUser => {
            //   console.log('all results 1'+ JSON.stringify(dbUser));
            const groupIds = dbUser.Groups.map(group => group.groupId);
            console.log(groupIds);
            //   console.log('all results 2'+ JSON.stringify(dbUser.Items));
            //   console.log('all results 3'+ JSON.stringify(dbUser.Groups));
            //   console.log('all results 4'+ JSON.stringify(dbUser.Groups));
            for (let j = 0; j < dbUser.Groups.length; j++) {
                //   console.log(JSON.stringify(dbUser.Groups[j].UserGroup.isAdmin));
                if (dbUser.Groups[j].UserGroup.isAdmin === true) {
                    administrates.push(dbUser.Groups[j]);
                } else {
                    belongsTo.push(dbUser.Groups[j]);
                }
            }
            db.ItemRequest.findAll({ where: { owner: userId } }).then(function (dbRequest) {
                // console.log(JSON.stringify(dbRequest));
                let pendingRequests = [];
                let confirmedRequests = [];
                for (let i = 0; i < dbRequest.length; i++) {
                    if (dbRequest[i].dataValues.confirmed === false) {
                        pendingRequests.push(dbRequest[i].dataValues);
                    } else if (dbRequest[i].dataValues.confirmed === true && dbRequest[i].dataValues.denied === false) {
                        confirmedRequests.push(dbRequest[i].dataValues);
                    }
                }
                db.Group.findAll({}).then(function (dbGroups) {
                    let otherGroups = [];
                    console.log('OTHERGROUPS                   ' + JSON.stringify(dbGroups));
                    for (let k; k < dbGroups.length; k++) {
                        if (administrates.includes(dbGroup[k]) === false && belongsTo.includes(dbGroup[k]) === false) {
                            otherGroups.push(dbGroup[k]);
                        }
                    }
                    //what we still need to render profile appropriately: show requests (group name and description) that the user has requested to join and are still pending, show requests to join groups where they are the administrator, show name of person requesting to join
                    db.GroupRequest.findAll({ where: { userIdToken: userId, status: 'pending' } }).then(function (dbGroupReqests) {
                        res.locals.metaTags = {
                            title: dbUser.userName + '\'s Profile',
                            description: 'See all your items available to borrow and add new items',
                            keywords: 'lending, borrow, friend-to-friend, save, view items, add items'
                        };
                        if (userId) {
                            res.render('profile', { loggedIn: Boolean(userId), user: dbUser, items: dbUser.Items, administrates: administrates, belongsTo: belongsTo, groups: otherGroups, pending: pendingRequests, confirmed: confirmedRequests, yourPendingGroups: dbGroupReqests });
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
                console.log(dbGroups);
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
