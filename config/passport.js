// add a reference to the passport strategy
var LocalStrategy = require('passport-local').Strategy;

// import the User Model
var User = require('../models/user');

module.exports = function(passport) {
	
	// SETUP for Session Storage and Retrieval
	
	//serialize user
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	
	//deserialze user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});
	
	passport.use('local-login', new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done) {
		
		// asynchronous process
		process.nextTick(function() {
			User.findOne({
				'username':username
			}, function(err, user) {
				if(err) {
					return done(err);
				}
				
				//no valid user found
				if(!user) {
					return done(null, false, req.flash('loginMessage', 'Incorrect Username'));
				}
				
				//no valid password entered
				if(!user.validPassword(password)) {
					return done(null, false, req.flash('loginMessage', 'Incorrect Password'));
				}
				
				//everything is ok - proceed with login
				return done(null, user);
			});
		});
	}));
	
	// Configure registration local strategy
	passport.use('local-registration', new LocalStrategy({
		passReqToCallback: true
	},
	
	function(req, username, password, done) {
		
		//asynchronous process
		process.nextTick(function() {
			// if the user is not already logged in
			if(!req.user) {
				User.findOne({'username': username},
				function(err, user) {
					//if any weird errors
					if(err) {
						return done(err);
					}
					//check if username is already in use
					if(user) {
						return done(null, false, req.flash('registerMessage', 'The username is already taken'));
					}
					else {
						// create the user
						var newUser = new User(req.body);
						newUser.password = newUser.generateHash(newUser.password);
						newUser.provider = 'local';
						newUser.created = Date.now();
						newUser.updated = Date.now();
						newUser.save(function(err) {
							if(err) {
								throw err;
							}
							return done(null, newUser);
						});
					}
				});
			} else {
				// everything ok, register the user
				return done(null, req.user);
			}
		});
	}));
	
}