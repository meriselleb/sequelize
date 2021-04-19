module.exports = (passport, User) => {
    var localStrategy = require('passport-local').Strategy
    var bCrypt = require('bcrypt-nodejs')

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
                done(null, user.get());
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
        var hash = (password) => bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
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
                    name: req.body.name,
                    header: req.body.header,
                    description: req.body.description,
                }).then((newUser, created) => {
                    if (!newUser) {
                        return done(null, false);
                    } else {
                        return done(null, newUser);
                    }
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

            return done(null, user.get())
        })
    }))
}