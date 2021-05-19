const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const session = require('express-session')
const cors = require('cors');
const jwt = require('express-jwt')

const { sequelize, User } = require('./sequelize');
const Routes = require('./routes');
const PassportStrategyInit = require('./passport')

const PopulateDB = require('./populate')

const app = express()

app.use(cors({
    origin: ["http://localhost:3000", "http://192.168.1.179:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization', 'Set-Cookie', 'Origin', 'Accept'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(session({
    secret: 'ekacnoom',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 36000,
        httpOnly: false,
        secure: false,
    }
}))

PassportStrategyInit(passport, User)
app.use(passport.initialize())
app.use(passport.session())

// app.use(function(req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", "http://192.168.1.179:3000");
//     res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Access-Control-Allow-Headers, Content-Type, Authorization, Origin, Accept, Set-Cookie");
//     res.setHeader('Access-Control-Allow-Credentials', true)
//     next();
// });

Routes(app, passport);

const port = 3001
app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`)
    
    var force = false;

    sequelize.sync({ force: force })
        .then(() => {
            console.log('Database & tables created!')
            PopulateDB();
        })
})