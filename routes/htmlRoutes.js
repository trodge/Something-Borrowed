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
                res.locals.metaTags = {
                    title: dbUser.userName + '\'s Profile',
                    description: 'See all your items available to borrow and add new items',
                    keywords: 'lending, borrow, friend-to-friend, save, view items, add items'
                };
                if (userId) {
<<<<<<< HEAD
                    res.render('profile', { loggedIn: Boolean(userId), user: dbUser, items: dbUser.Items, administrates: administrates, belongsTo: belongsTo, pending: pendingRequests, confirmed: confirmedRequests });
=======
                    desiredMenu = {
                        home: '<li><a href="/">Home</a></li>',
                        profile: '<li class="currentPage"><a href="/profile">Profile</a></li>',
                        items: '<li><a href="/items">Items</a></li>',
                        signOut: '<button onclick="signOut();">Sign Out</button>'
                    };
                    res.render('profile', { navData: desiredMenu, user: dbUser, items: dbUser.Items, administrates: administrates, belongsTo: belongsTo, pending: pendingRequests, confirmed: confirmedRequests });
>>>>>>> origin/items
                } else {
                    res.render('unauthorized', { loggedIn: Boolean(userId), msg: 'You must be signed in to view your profile.' });
                }
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
        db.User.findOne({ include: db.Group }).then(dbUser => {
            const groupIds = dbUser.Groups.map(group => group.groupId);
            console.log(groupIds);
            db.Group.findAll({
                where: {
                    groupId: groupIds
                }, include: db.Item
            }).then(dbGroups => {
                console.log(dbGroups);
                // Render here. dbGroups is an array of groups. Each group has an array of Items.
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
                    loggedIn: Boolean(userId),
                    items: Array.from(dbItems)
                });
            });
        });
    });

    app.get('/search/:query', function (req, res) {
        const userId = req.cookies.userid;
        const searchQuery = req.params.query;
        console.log(`html route ${searchQuery}`);
        db.Item.findAll({ where: { itemName: searchQuery } }).then(function (dbSearch) {
            if (dbSearch.length > 0) {
                console.log(dbSearch);
                res.render('searchResults', {
                    loggedIn: Boolean(userId),
                    searchResults: dbSearch
                });
            } else {
                res.render('searchResults', {
                    loggedIn: Boolean(userId),
                    noResults: '<h3>Your query returned no results.</h3>'
                });
            }
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
