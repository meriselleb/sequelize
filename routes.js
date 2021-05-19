const availableConnection = require('./models/availableConnection');
const { User, Blog, Tag, Thread, Comment, Vote, sequelize } = require('./sequelize')
const jwt = require('jsonwebtoken');

function createdAtCmp(p1, p2) {
    if (p1.createdAt > p2.createdAt) {
        return -1
    }
    else if (p1.createdAt < p2.createdAt) {
        return 1
    }
    else {
        return 0;
    }
}

function mapLike(like) {
    return ({
        userHandle: like.userId,
        postId: like.threadId,
    })
}

function mapComment(comment, user) {
    return ({
        ...comment.get(),
        body: comment.text,
        createdAt: comment.createdAt,
        userImage: user.imageUrl,
        userHandle: user.handle,
    })
}

function mapPost(thread, user) {
    return ({
        ...thread.get(),
        body: thread.text,
        likeCount: thread.votes.length,
        commentCount: thread.comments.length,
        userHandle: user.handle,
        userImage: user.imageUrl,
        postId: thread.id,
        likes: thread.votes.map(mapLike),
        comments: thread.comments.map(c => mapComment(c, c.user)).sort((p1, p2) => createdAtCmp(p2, p1)),
    })
}

function mapUser(user) {
    return ({
        ...user.get(),
        credentials: makeCredentials(user),
    })
}

function makeCredentials(user) {
    return ({
        handle: user.handle,
        imageUrl: user.imageUrl,
        bio: user.bio,
        website: user.website,
        location: user.location,
    });
}

function getNewPosts(page) {
    return (
        Thread.findAll({
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * 10,
            limit: 10,
            include: [{
                model: Comment,
                include: [User],
            }, {
                model: Vote
            }, {
                model: User
            }]
        })
    )
}

function getHotPosts(page) {
    return (
        Thread.findAll({
            attributes: [
                '*',
                [sequelize.literal('(select count(*) from Comments where Comments.threadId = Threads.id)'), 'CommentCount']
            ],
            order: [sequelize.literal('CommentCount'), 'DESC'],
            offset: (page - 1) * 10,
            limit: 10,
            include: [{
                model: Comment,
                include: [User],
            }, {
                model: Vote
            }, {
                model: User
            }]
        })
    )
}

function getPosts(type, page) {
    switch(type) {
        case "new":
            return getNewPosts(page);
            break;
        case "hot":
            return getHotPosts(page);
            break;
    }
    
}

module.exports = (app, passport) => {
    app.get('/user', passport.authenticate('jwt'), (req, res) => {
        var user = req.user;

        user.getVotes()
            .then(votes => {
                res.send({
                    ...user.get(),
                    credentials: makeCredentials(user),
                    likes: votes.map(mapLike),
                })
            })
    })
    
    app.get('/user/:userHandle', (req, res) => {
        var handle = req.params.userHandle;
        
        User.findOne({
            where: {
                handle: handle,
            },
            include: [{
                model: Thread,
                include: [{
                    model: Comment,
                    include: [User],
                }, {
                    model: Vote
                }],
            }, {
                model: Vote,
            }],
        })
            .then(user => {
                if (user) {
                    res.send({
                        user: {
                            ...mapUser(user),
                            likes: user.votes.map(mapLike),
                        },
                        posts: user.threads.map(t => mapPost(t, user)),
                    })
                }
                else {
                    res.sendStatus(400);
                }
            })
    })

    // SIGN UP
    //
    app.post('/signup', passport.authenticate('local-signup'), (req, res) => {
        var user = req.user;
        res.send({
            user: user,
            token: jwt.sign({email: user.email}, 'ekacnoom'),
        })
    })


    // LOG IN
    app.post('/login', passport.authenticate('local-signin'), (req, res) => {
        var user = req.user;
        res.send({
            user: user,
            token: jwt.sign({email: user.email}, 'ekacnoom'),
        })
    })

    // POST THREAD
    app.post('/post', passport.authenticate('jwt'), (req, res) => {
        var user = req.user;
        Thread.create({
            title: req.body.title,
            text: req.body.body,
        }).then(thread => {
            thread.setUser(user);
            thread.comments = []
            thread.votes = []
            res.send(mapPost(thread, user));
        })
    })
    
    app.get('/post/:postId', passport.authenticate('jwt'), (req, res) => {
        var postId = req.params.postId;

        Thread.findOne({
            where: {
                id: postId
            },
            include: [{
                model: Comment,
                include: [User],
            }, {
                model: Vote
            }],
        })
            .then(thread => {
                if (thread) {
                    res.send(mapPost(thread, req.user));
                }
                else {
                    res.sendStatus(400);
                }
            })
    })
    
    app.delete('/post/:postId', passport.authenticate('jwt'), (req, res) => {
        var postId = req.params.postId;
        var user = req.user;
        
        Thread.findOne({
            where: {
                id: postId,
            },
            include: [{
                model: Comment,
                include: [User],
            }, {
                model: Vote
            }],
        })
            .then(thread => {
                if (thread.userId === user.id) {
                    Promise.all([
                        ...thread.comments.map(c => c.destroy()),
                        ...thread.votes.map(v => v.destroy()),
                    ])
                        .then(() => {
                            thread.destroy();
                        })

                    res.sendStatus(200);
                }
                else {
                    res.sendStatus(400);
                }
            })
    })
    
    app.get('/posts', (req, res) => {
        getPosts('new', 1)
            .then(threads => {
                res.send({
                    posts: threads.map(t => mapPost(t, t.user)),
                })
            })
    })

    // GET ALL USER THREADS 
    app.get('/posts/:type/:pageNum', (req, res) => {
        var type = req.params.type;
        var page = req.params.pageNum;
        
        getPosts(type, page)
            .then(threads => {
                res.send({
                    posts: threads.map(t => mapPost(t, t.user)),
            })
        })
    })

    // POST COMMENT
    app.post('/post/:postId/comment', passport.authenticate('jwt'), (req, res) => {
        var postId = req.params.postId;
        var user = req.user;
        
        Promise.all([
            Comment.create({
                text: req.body.body,
            }),
            Thread.findOne({
                where: {
                    id: postId,
                }
            })
        ])
            .then(([comment, thread]) => {
                comment.setUser(user);
                comment.setThread(thread);
                res.send(mapComment(comment, user));
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
    app.get('/post/:postId/like', passport.authenticate('jwt'), (req, res) => {
        var user = req.user;
        var postId = req.params.postId;
        
        Vote.findOrCreate({
            where: {
                userId: user.id,
                threadId: postId,
            }
        })
            .then((vote, created) => {
                Thread.findOne({
                    where: {
                        id: postId,
                    },
                    include: [{
                        model: Comment,
                        include: [User],
                    }, {
                        model: Vote
                    }],
                })
                    .then(thread => {
                        if (thread) {
                            res.send(mapPost(thread, user));
                        }
                        else {
                            vote.destroy();
                            res.sendStatus(400);
                        }
                    })
            })
            .catch(err => {
                res.status(400);
                res.send({
                    general: err.message
                })
            })
    })
    
    app.get('/post/:postId/unlike', passport.authenticate('jwt'), (req, res) => {
        var user = req.user;
        var postId = req.params.postId;
        
        Vote.findOne({
            where: {
                userId: user.id,
                threadId: postId,
            }
        })
            .then(vote => {
                if (vote) {
                    vote.destroy()
                        .then(() => {
                            Thread.findOne({
                                where: {
                                    id: postId,
                                },
                                include: [{
                                    model: Comment,
                                    include: [User],
                                }, {
                                    model: Vote
                                }],
                            })
                                .then(thread => {
                                    if (thread) {
                                        res.send(mapPost(thread, user));
                                    }
                                    else {
                                        vote.destroy();
                                        res.sendStatus(400);
                                    }
                                })
                        })
                }
                else {
                    res.sendStatus(400);
                }
            })
    })

    // ETC 

    // SEND CONNECTION REQUEST
    app.post('/sendRequest', (req, res) => {
        User.findOne({
            where: {
                id: req.body.userID
            }
        }).then(user => {
            User.findOne({
                where: {
                    id: req.body.receiverID
                }
            }).then(receiver => {
                if (user != null && receiver != null) {
                    user.hasConnectionTo(receiver)
                        .then(hasConnect => {
                            if (hasConnect) {
                                res.send("already connected");
                            }
                            else {
                                user.hasRequestFrom(receiver)
                                    .then(hasRequest => {
                                        if (hasRequest) {
                                            res.send("this user sent you a request already!");
                                        }
                                        else {
                                            user.hasRequestTo(receiver)
                                                .then(hasRequest => {
                                                    if (hasRequest) {
                                                        res.send("you have sent a request already!");
                                                    }
                                                    else {
                                                        user.addRequestTo(receiver);
                                                        res.send("Request has been sent");
                                                    }
                                                })
                                        }

                                    })
                            }
                        })
                }
            })
        })
    })


    // ACCEPT CONNECTION REQUEST

    app.post('/acceptRequest', (req, res) => {
        User.findOne({
            where: {
                id: req.body.userID
            } 
        }).then(user => {
            User.findOne({
                where: {
                    id: req.body.senderID
                }
            }).then(sender => {
                if (user != null && sender != null) {
                    user.hasRequestFrom(sender)
                        .then(hasRequest => {
                            if (hasRequest) {
                                user.addConnectionFrom(sender);
                                user.addConnectionTo(sender);
                                res.send("Connect Request Accepted. You are now Connected.");
                            } else {
                                res.send("Error");
                            }                                       
                        })
                    }
                })
            })
        
    })

    // DELETE CONNECTION REQUEST

    app.post('/declineRequest', (req, res) => {
        User.findOne({
            where: {
                id: req.body.userID
            } 
        }).then(user => {
            User.findOne({
                where: {
                    id: req.body.senderID
                }
            }).then(sender => {
                if (user != null && sender != null) {
                    user.hasRequestFrom(sender)
                        .then(hasRequest => {
                            if (hasRequest) {
                                user.removeRequestFrom(sender);
                                res.send("Connection Request has been rejected. >:)");
                            } else {
                                res.send("Error");
                            }                                       
                        })
                    }
                })
            })
        
    })
    
    /* OTHER THINGS:
    - connection threshold
    - ranking
    - populating profile page, connections, and available connections
    - NOTIFICATIONS
    - BADGES
    - MESSAGING
    - populating users
    */


    app.get('/', (req, res) => {
        res.send("<div></div>");
    })

    // populate test data
    app.get('/populate', (req, res) => {
        User.findAll().then(users => {
            if (users.length > 0) {
                console.log('already populated');
                // populate
            } 
            else {
                populate();  
            }

            res.sendStatus(200);
        })

    })

    // function to populate TEST DATA
 
}