const { User, Blog, Tag, Thread, Comment, Vote } = require('./sequelize')

module.exports = (app, passport) => {

    // SIGN UP
    app.post('/signup', passport.authenticate('local-signup'), (req, res, done) => {
        res.sendStatus(200);
    })

    // LOG IN
    app.post('/login', passport.authenticate('local-signin'), (req, res, done) => {
        User.findOne({
            where: {
                email: req.body.email,
            }
        }).then(user => {
            res.send(user.get());
        })
    })

    // POST THREAD
    app.post('/postthread', (req, res) => {
        Thread.create({
            title: req.body.title,
            text: req.body.text,
        }).then(thread => {
            User.findOne(({
                where: {
                    id: req.body.userId,
                }
            })).then(user => {
                thread.setUser(user);
                res.sendStatus(200);
            })
        })
    })

    // GET ALL USER THREADS
    app.post('/getthreads', (req, res) => {
        User.findOne({
            where: {
                id: req.body.userId,
            }
        }).then(user => {
            user.getThreads().then(threads => {
                res.send(threads);
            })
        })
    })

    // POST COMMENT
    app.post('/postcomment', (req, res) => {
        Comment.create({
            text: req.body.text, 
        }).then(comment => {
            Thread.findOne(({
                where: {
                    id: req.body.threadId,
                }
            })).then(thread => {
                User.findOne({
                    where: {
                        id: req.body.userId,
                    }
                }).then(user => {
                    comment.setUser(user);
                })
                comment.setThread(thread);
                res.sendStatus(200);
            })
        })
    })

    // GET ALL USER COMMENTS
    app.post('/getUserComments', (req, res) => {
        User.findOne({
            where: {
                id: req.body.userID,
            }
        }).then(user => {
            user.getComments().then(comments => {
                res.send(comments);
            })
        })
    })

    // POST VOTE
    // in progress
   /* app.post('/makeVote', (req, res) => {
        Vote.create({
            vote: req.body.voteBool,
        }).then(vote => {
            Thread.findOne(({
                where: {
                    id: req.body.theadID,
                }
            })).then( thread => {
                vote.setThread(thread);
                res.sendStatus(200);
            })
        })
    }) */



    // ETC 
    app.get('/', (req, res) => {
        res.send("<div></div>");
    })
}