var localStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var JWTStrategy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;
const salt = bCrypt.genSaltSync(8);


module.exports = (passport, User) => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser((id, done) => {
        User.findOne({
            where: {
                id: id,
            }
        }).then(user => {
            if (user) {
                done(null, user);
            }
            else {
                done(user.errors, null);
            }
        })
    })

    passport.use('local-signup', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    }, (req, email, password, done) => {
        if (req.body.password != req.body.confirmPassword) {
            return done(null, false, {
                message: "Confirm password failed.",
            })
        }
        
        if (req.body.password == "" || req.body.email == "") {
            return done(null, false, {
                message: "Email and password are required.",
            })
        }

        var hash = (password) => bCrypt.hashSync(password, salt, null);
        User.findOne({
            where: {
                email: email,
            }
        }).then((user) => {
            if (user) {
                return done(null, false, {
                    message: "Email is taken."
                })
            } else {
                const pw = hash(password)
                User.create({
                    email: email,
                    password: pw,
                    handle: req.body.handle,
                }).then((newUser, created) => {
                    if (!newUser) {
                        return done(null, false);
                    } else {
                        req.user = newUser;
                        return done(null, newUser);
                    }
                }).catch(err => {
                    console.log(err);
                    return done(null, false, {
                        message: err.message,
                    })
                })
            }
        })
    }))

    passport.use('local-signin', new localStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    }, (req, email, password, done) => {
        var verify = (userpass, password) => bCrypt.compareSync(password, userpass)
        User.findOne({
            where: {
                email: email,
            }
        }).then(user => {
            if (!user) {
                return done(null, false, {
                    message: "User does not exist."
                })
            }

            if (!verify(user.password, password)) {
                return done(null, false, {
                    message: "Incorrect password."
                })
            }
            
            req.user = user;

            return done(null, user)
        })
    }))
    
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken("authorization"),
        secretOrKey: 'ekacnoom',
    }, (payload, done) => {
        User.findOne({
            where: {
                email: payload.email,
            }
        })
            .then(user => {
                if (user) {
                    done(null, user);
                }
                else {
                    done(null, false);
                }
            })
            .catch(console.log);
    }))
}