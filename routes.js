const { User, Blog, Tag } = require('./sequelize')

module.exports = (app, passport) => {
    app.post('/signup', passport.authenticate('local-signup'), (req, res, done) => {
        res.sendStatus(200);
    })

    app.post('/login', passport.authenticate('local-signin'), (req, res, done) => {
        User.findOne({
            where: {
                email: req.body.email,
            }
        }).then(user => {
            res.send(user.get());
        })
    })

    app.get('/', (req, res) => {
        res.send("<div></div>");
    })
}