const db = require('../models');
module.exports = function (app) {
    // let currentCategories = [];

    app.get('/', function (req, res) {
        res.locals.metaTags = {
            title: 'Something Borrowed',
            description: 'Helping you save money through friend-to-friend lending; don\'t buy when you can borrow!',
            keywords: 'lending, borrow, friend-to-friend, save'
        };
        let desiredMenu;
        if (req.cookies.userid) {
            desiredMenu = {
                home: '<li class="currentPage"><a href="/">Home</a></li>',
                profile: '<li><a href="/profile">Profile</a></li>',
                items: '<li><a href="/items">Items</a></li>',
                signOut: '<button onclick="signOut();">Sign Out</button>'
            };
            res.render('index', {
                navData: desiredMenu
            });
        } else {
            desiredMenu = {
                home: '<li class="currentPage"><a href="/">Home</a></li>',
                items: '<li><a href="/items">Items</a></li>',
                signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
            };
            res.render('index', {
                navData: desiredMenu
            });
        }
    });

    app.get('/profile', function (req, res) {
        const userId = req.cookies.userid;
        let administrates = [];
        let belongsTo = [];
        db.User.findOne({ where: {userIdToken: userId}, include: [db.Group, db.Item] }).then(dbUser => {
        //   console.log('all results 1'+ JSON.stringify(dbUser));
            const groupIds = dbUser.Groups.map(group => group.groupId);
            console.log(groupIds);
            //   console.log('all results 2'+ JSON.stringify(dbUser.Items));
            //   console.log('all results 3'+ JSON.stringify(dbUser.Groups));
            //   console.log('all results 4'+ JSON.stringify(dbUser.Groups));
            for (let j=0; j < dbUser.Groups.length; j++) {
            //   console.log(JSON.stringify(dbUser.Groups[j].UserGroup.isAdmin));
                if (dbUser.Groups[j].UserGroup.isAdmin === true) {
                    administrates.push(dbUser.Groups[j]);
                } else {
                    belongsTo.push(dbUser.Groups[j]);
                }
            }
            db.ItemRequest.findAll({ where: {owner: userId}}).then(function (dbRequest) {
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
                let desiredMenu;
                if (userId) {
                    desiredMenu = {
                        home: '<li><a href="/">Home</a></li>',
                        profile: '<li class="currentPage"><a href="/profile">Profile</a></li>',
                        items: '<li><a href="/items">Items</a></li>',
                        signOut: '<button onclick="signOut();">Sign Out</button>'
                    };
                    res.render('profile', { navData: desiredMenu, user: dbUser, items: dbUser.Items, administrates: administrates, belongsTo: belongsTo, pending: pendingRequests, confirmed: confirmedRequests});
                } else {
                    desiredMenu = {
                        home: '<li><a href="/">Home</a></li>',
                        items: '<li><a href="/items">Items</a></li>',
                        signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                    };
                    res.render('unauthorized', { navData: desiredMenu, msg: 'You must be signed in to view your profile.' });
                }
            });
        });


        // db.User.findAll({ where: { userIdToken: userId }, include: db.Item}).then(function (dbUser) {
        //     console.log('all results'+ JSON.stringify(dbUser[0].dataValues.Items));
        //     console.log('returned' + dbUser[0].dataValues.userName);
        //     db.ItemRequest.findAll({ where: {owner: userId}}).then(function (dbRequest) {
        //         console.log(JSON.stringify(dbRequest));
        //         let pendingRequests = [];
        //         let confirmedRequests = [];
        //         let deniedRequests = [];
        //         for (let i = 0; i < dbRequest.length; i++) {
        //             if (dbRequest[i].dataValues.confirmed === false) {
        //                 pendingRequests.push(dbRequest[i].dataValues);
        //             } else if (dbRequest[i].dataValues.confirmed === true || dbRequest[i].dataValues.denied === true) {
        //                 confirmedRequests.push(dbRequest[i].dataValues);
        //             } else if (dbRequest[i].dataValues.denied === true) {
        //                 deniedRequests.push(dbRequest[i].dataValues);
        //             }
        //         }
        //         console.log('pending ' + JSON.stringify(pendingRequests));
        //         res.locals.metaTags = {
        //             title: dbUser[0].dataValues.userName + '\'s Profile',
        //             description: 'See all your items available to borrow and add new items',
        //             keywords: 'lending, borrow, friend-to-friend, save, view items, add items'
        //         };
        //         let desiredMenu;
        //         if (userId) {
        //             desiredMenu = {
        //                 home: '<button><a href="/">Home</a>',
        //                 items: '<button><a href="/items">Items</a></button>',
        //                 signOut: '<button onclick="signOut();">Sign Out</button>'
        //             };
        //             res.render('profile', { navData: desiredMenu, user: dbUser[0].dataValues, items: dbUser[0].dataValues.Items, pending: pendingRequests, confirmed: confirmedRequests, denied: deniedRequests });
        //         } else {
        //             desiredMenu = {
        //                 home: '<button><a href="/">Home</a>',
        //                 items: '<button><a href="/items">Items</a></button>',
        //                 signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
        //             };
        //             res.render('unauthorized', { navData: desiredMenu, msg: 'You must be signed in to view your profile.' });
        //         }
        //     });

        // });
    });

    app.get('/profile/new', function (req, res) {
        const userId = req.cookies.userid;
        db.User.findAll({ where: { userIdToken: userId } }).then(function (dbUser) {
            res.locals.metaTags = {
                title: 'Create Profile',
                description: 'Complete your new profile so you can save money through friend-to-friend lending',
                keywords: 'lending, borrow, friend-to-friend, save'
            };
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<li><a href="/">Home</a></li>',
                    items: '<li><a href="/items">Items</a></li>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                res.render('createProfile', {
                    navData: desiredMenu,
                    user: dbUser[0].dataValues
                });
            } else {
                desiredMenu = {
                    home: '<li><a href="/">Home</a></li>',
                    items: '<li><a href="/items">Items</a></li>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('unauthorized', { navData: desiredMenu, msg: 'You must sign in with Google before being able to complete your profile.', user: dbUser[0].dataValues });
            }
        });
    });

    app.get('/items/:category', function (req, res) {
        const userId = req.cookies.userid;
        const selectedCategory = req.params.category;
        db.User.findOne({ include: db.Group }).then(dbUser => {
            const groupIds = dbUser.Groups.map(group => group.groupId);
            console.log(groupIds);
            dbUser.getGroups({ include: db.Item }).then(dbGroups => {
                console.log(dbGroups);
                // Render here. dbGroups is an array of groups. Each group has an array of Items.
                dbItems = [];
                dbGroups.forEach(dbGroup => {
                    dbItems = dbItems.concat(dbGroup.items.filter(
                        item => selectedCategory == 'all' || item.itemCategory == selectedCategory));
                });
                res.render('items', {
                    loggedIn: Boolean(userId),
                    items: dbItems
                });
            });
        });
    });

    app.get('/search/:query', function (req, res) {
        const userId = req.cookies.userid;
        const searchQuery = req.params.query;
        console.log(`html route ${searchQuery}`);
        db.Item.findAll({ where: { itemName: searchQuery } }).then(function (dbSearch) {
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<li><a href="/">Home</a></li>',
                    profile: '<li><a href="/profile">Profile</a></li>',
                    items: '<li><a href="/items">Items</a></li>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                if (dbSearch.length > 0) {
                    console.log(dbSearch);
                    res.render('searchResults', {
                        navData: desiredMenu,
                        searchResults: dbSearch
                    });
                } else {
                    res.render('searchResults', {
                        navData: desiredMenu,
                        noResults: '<h3>Your query returned no results.</h3>'
                    });
                }
            } else {
                desiredMenu = {
                    home: '<li><a href="/">Home</a></li>',
                    items: '<li><a href="/items">Items</a></li>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                if (dbSearch.length > 0) {
                    console.log(dbSearch);
                    res.render('searchResults', {
                        navData: desiredMenu,
                        searchResults: dbSearch
                    });
                } else {
                    res.render('searchResults', {
                        navData: desiredMenu,
                        noResults: '<h3>Your query returned no results.</h3>'
                    });
                }
            }
        });
    });

    app.get('*', function (req, res) {
        res.locals.metaTags = {
            title: 'Error',
            description: 'Page not found.',
            keywords: 'error'
        };
        let desiredMenu;
        if (req.cookies.userid) {
            desiredMenu = {
                home: '<li><a href="/">Home</a></li>',
                profile: '<li><a href="/profile">Profile</a></li>',
                items: '<li><a href="/items">Items</a></li>',
                signOut: '<button onclick="signOut();">Sign Out</button>'
            };
            res.render('404', { navData: desiredMenu });
        } else {
            desiredMenu = {
                home: '<li><a href="/">Home</a></li>',
                items: '<li><a href="/items">Items</a></li>',
                signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
            };
            res.render('404', { navData: desiredMenu });
        }
    });


};
