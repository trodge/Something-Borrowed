
const db = require('../models');
module.exports = function (app) {
    let currentCategories = [];

    app.get('/', function (req, res) {
        res.locals.metaTags = {
            title: 'Something Borrowed',
            description: 'Helping you save money through friend-to-friend lending; don\'t buy when you can borrow!',
            keywords: 'lending, borrow, friend-to-friend, save'
        };
        let desiredMenu;
        if (req.cookies.userid) {
            desiredMenu = {
                profile: '<button><a href="/profile">Profile</a>',
                items: '<button><a href="/items">Items</a></button>',
                signOut: '<button onclick="signOut();">Sign Out</button>'
            };
            res.render('index', {
                navData: desiredMenu
            });
        } else {
            desiredMenu = {
                items: '<button><a href="/items">Items</a></button>',
                signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
            };
            res.render('index', {
                navData: desiredMenu
            });
        }
    });

    app.get('/profile', function (req, res) {
        const userId = req.cookies.userid;
        db.User.findAll({ where: { userIdToken: userId }, include: [db.Item] }).then(function (dbUser) {
            console.log('all results' + JSON.stringify(dbUser[0].dataValues.Items));
            console.log('returned' + dbUser[0].dataValues.userName);
            db.Request.findAll({ where: { owner: userId } }).then(function (dbRequest) {
                console.log(JSON.stringify(dbRequest));
                let pendingRequests = [];
                let confirmedRequests = [];
                let deniedRequests = [];
                for (let i = 0; i < dbRequest.length; i++) {
                    if (dbRequest[i].dataValues.confirmed === false) {
                        pendingRequests.push(dbRequest[i].dataValues);
                    } else if (dbRequest[i].dataValues.confirmed === true || dbRequest[i].dataValues.denied === true) {
                        confirmedRequests.push(dbRequest[i].dataValues);
                    } else if (dbRequest[i].dataValues.denied === true) {
                        deniedRequests.push(dbRequest[i].dataValues);
                    }
                }
                console.log('pending ' + JSON.stringify(pendingRequests));
                res.locals.metaTags = {
                    title: dbUser[0].dataValues.userName + '\'s Profile',
                    description: 'See all your items available to borrow and add new items',
                    keywords: 'lending, borrow, friend-to-friend, save, view items, add items'
                };
                let desiredMenu;
                if (userId) {
                    desiredMenu = {
                        home: '<button><a href="/">Home</a>',
                        items: '<button><a href="/items">Items</a></button>',
                        signOut: '<button onclick="signOut();">Sign Out</button>'
                    };
                    res.render('profile', { navData: desiredMenu, user: dbUser[0].dataValues, items: dbUser[0].dataValues.Items, pending: pendingRequests, confirmed: confirmedRequests, denied: deniedRequests });
                } else {
                    desiredMenu = {
                        home: '<button><a href="/">Home</a>',
                        items: '<button><a href="/items">Items</a></button>',
                        signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                    };
                    res.render('unauthorized', { navData: desiredMenu, msg: 'You must be signed in to view your profile.' });
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
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    items: '<button><a href="/items">Items</a></button>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                res.render('createProfile', {
                    navData: desiredMenu,
                    user: dbUser[0].dataValues
                });
            } else {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    items: '<button><a href="/items">Items</a></button>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('unauthorized', { navData: desiredMenu, msg: 'You must sign in with Google before being able to complete your profile.', user: dbUser[0].dataValues });
            }
        });
    });

    app.get('/items', function (req, res) {
        const userId = req.cookies.userid;
        db.Item.findAll({}).then(function (dbItems) {
            console.log('check here ' + JSON.stringify(dbItems));
            for (let i = 0; i < dbItems.length; i++) {
                if (currentCategories.includes(dbItems[i].itemCategory) === false) {
                    currentCategories.push(dbItems[i].itemCategory);
                }
            }
            console.log(currentCategories);
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    profile: '<button><a href="/profile">Profile</a>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                res.render('items', {
                    navData: desiredMenu,
                    items: dbItems,
                    categories: currentCategories
                });
            } else {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('items', {
                    navData: desiredMenu,
                    items: dbItems,
                    categories: currentCategories
                });
            }
        });
    });

    app.get('/items/:category', function (req, res) {
        const userId = req.cookies.userid;
        const selectedCategory = req.params.category;
        console.log(selectedCategory);
        db.Item.findAll({ where: { itemCategory: selectedCategory } }).then(function (dbItems) {
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    profile: '<button><a href="/profile">Profile</a>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                res.render('items', {
                    navData: desiredMenu,
                    items: dbItems,
                    categories: currentCategories
                });
            } else {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('items', {
                    navData: desiredMenu,
                    items: dbItems,
                    categories: currentCategories
                });
            }
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
                    home: '<button><a href="/">Home</a>',
                    profile: '<button><a href="/profile">Profile</a>',
                    items: '<button><a href="/items">Items</a></button>',
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
                    home: '<button><a href="/">Home</a>',
                    items: '<button><a href="/items">Items</a></button>',
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
                home: '<button><a href="/">Home</a>',
                profile: '<button><a href="/profile">Profile</a></button>',
                items: '<button><a href="/items">Items</a></button>',
                signOut: '<button onclick="signOut();">Sign Out</button>'
            };
            res.render('404', { navData: desiredMenu });
        } else {
            desiredMenu = {
                home: '<button><a href="/">Home</a>',
                items: '<button><a href="/items">Items</a></button>',
                signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
            };
            res.render('404', { navData: desiredMenu });
        }
    });


};
