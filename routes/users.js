var express = require('express');
var passport = require('passport');
var router = express.Router();

var User = require('../models/user');

/* Utility functin to check if user is authenticatd */
function requireAuth(req, res, next){

  // check if the user is logged in
  if(!req.isAuthenticated()){
    res.redirect('/login');
  }
  next();
}

/* Render Users main page. */
router.get('/', requireAuth, function (req, res, next) {
    User.find(function (err, users) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.render('users/index', {
                title: 'Users',
                users: users,
                displayName: req.user ? req.user.displayName : ''
            });
        }
    });
});

/* Render the Add Users Page */
router.get('/add', requireAuth, function (req, res, next) {
    res.render('users/add', {
        title: 'Users',
        displayName: req.user ? req.user.displayName : ''
    });
});

/* process the submission of a new user */
router.post('/add', requireAuth, function (req, res, next) {
    var user = new User(req.body);
    var hashedPassword = user.generateHash(user.password);
    User.create({
        email: req.body.email,
        password: hashedPassword,
        displayName: req.body.displayName,
        provider: 'local',
        created: Date.now(),
        updated: Date.now()
    }, function (err, User) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.redirect('/users');
        }
    });
});

/* Render the User Edit Page */
router.get('/:id', requireAuth, function (req, res, next) {
    // create an id variable
    var id = req.params.id;
    // use mongoose and our model to find the right user
    User.findById(id, function (err, user) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            //show the edit view
            res.render('users/edit', {
                title: 'Users',
                user: user,
                displayName: req.user ? req.user.displayName : ''
            });
        }
    });
});

/* process the edit form submission */
router.post('/:id', requireAuth, function (req, res, next) {
    var id = req.params.id;
    var user = new User(req.body);
    user.password = user.generateHash(user.password);
    user._id = id;
    user.updated = Date.now();
    
    // use mongoose to do the update
    User.update({ _id: id }, user, function (err) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.redirect('/users');
        }
    });
});

/* run delete on the selected user */
router.get('/delete/:id', requireAuth, function (req, res, next) {
    var id = req.params.id;
    User.remove({ _id: id }, function (err) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.redirect('/users');
        }
    });
});

module.exports = router;
