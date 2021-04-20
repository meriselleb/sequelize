const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const session = require('express-session')

const { sequelize, User } = require('./sequelize');
const Routes = require('./routes');
const PassportStrategyInit = require('./passport')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(session({
    secret: 'ekacnoom',
    resave: true,
    saveUninitialized: true,
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Access-Control-Allow-Headers, Content-Type, Authorization, Origin, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true)
    next();
});

PassportStrategyInit(passport, User)
Routes(app, passport);

const port = 3001
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`)

    sequelize.sync({ force: false })
        .then(() => {
            console.log('Database & tables created!')
        })
})