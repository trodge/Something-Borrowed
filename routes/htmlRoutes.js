
const models = require('../models');

module.exports = function (app) {
    app.get('/', function (req, res) {
        models.Item.findAll({}).then(function (item) {
            console.log(item);
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
                    navData: desiredMenu, 
                    location: 'Bellevue, WA',
                    items: item
                });
            } else {
                desiredMenu = {
                    items: '<button><a href="/items">Items</a></button>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('index', {
                    navData: desiredMenu,
                    location: 'Bellevue, WA',
                    items: item
                });
            }
        });
    });

    app.get('/profile', function (req, res) {
        const userId = req.cookies.userid;
        models.User.findAll({ where: { userIdToken: userId }, include: [models.Item, {
            model: models.Group}]}).then(function (modelsUser) {
            console.log('all results'+ JSON.stringify(modelsUser[0].dataValues.Items));
            console.log('returned' + modelsUser[0].dataValues.userName);
            res.locals.metaTags = {
                title: modelsUser[0].dataValues.userName + '\'s Profile',
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
                res.render('profile', { navData: desiredMenu, user: modelsUser[0].dataValues });
            } else {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    items: '<button><a href="/items">Items</a></button>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('unauthorized', { navData: desiredMenu, msg: 'You must be signed in to view your profile.', user: modelsUser[0].dataValues });
            }
        });
    });

    app.get('/profile/new', function (req, res) {
        const userId = req.cookies.userid;
        models.User.findAll({ where: { userIdToken: userId } }).then(function (modelsUser) {
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
                    user: modelsUser[0].dataValues
                });
            } else {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    items: '<button><a href="/items">Items</a></button>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('unauthorized', { navData: desiredMenu, msg: 'You must sign in with Google before being able to complete your profile.', user: modelsUser[0].dataValues });
            }
        });
    });

    app.get('/items', function (req, res) {
        const userId = req.cookies.userid;
        models.Item.findAll({}).then(function (item) {
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    profile: '<button><a href="/profile">Profile</a>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                res.render('items', {
                    navData: desiredMenu,
                    items: item
                });
            } else {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    signIn: '<button data-toggle="modal" data-target="#signInModal">Sign In</button>'
                };
                res.render('items', {
                    navData: desiredMenu,
                    items: item
                });
            }
        });
    });

    app.get('/search/:query', function (req, res) {
        const userId = req.cookies.userid;
        const searchQuery = req.params.query;
        console.log(`html route ${searchQuery}`);
        models.Item.findAll({ where: { itemName: searchQuery } }).then(function (modelsSearch) {
            let desiredMenu;
            if (userId) {
                desiredMenu = {
                    home: '<button><a href="/">Home</a>',
                    profile: '<button><a href="/profile">Profile</a>',
                    items: '<button><a href="/items">Items</a></button>',
                    signOut: '<button onclick="signOut();">Sign Out</button>'
                };
                if (modelsSearch.length > 0) {
                    console.log(modelsSearch);
                    res.render('searchResults', {
                        navData: desiredMenu,
                        searchResults: modelsSearch
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
                if (modelsSearch.length > 0) {
                    console.log(modelsSearch);
                    res.render('searchResults', {
                        navData: desiredMenu,
                        searchResults: modelsSearch
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
