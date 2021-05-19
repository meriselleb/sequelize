const jqCsv = require('jquery-csv');
const fs = require('fs')
const { User, Thread, Comment, Vote,  } = require('./sequelize');
const Sequelize = require('sequelize');

function findRandom(model, count) {
    return model.findAll({
        order: Sequelize.literal('rand()'),
        limit: count,
    });
}

function readData(fn) {
    return jqCsv.toObjects(fs.readFileSync(fn, 'utf-8'))
}

function populateUsers() {
    var bCrypt = require('bcrypt-nodejs')
    const salt = bCrypt.genSaltSync(8);
    var hash = (password) => bCrypt.hashSync(password, salt, null);

    var userDataFn = "/data/top_100_users_by_reputation.csv"
    var otherUserDataFn = "/data/users_commented_on_posts_by_top_100_users.csv"
    
    return (
        User.count()
            .then(userCount => {
                if (userCount == 0) {
                    console.log("Populating Users");

                    var anonUserCreate = User.create({
                        email: "anonymous@email.com",
                        password: hash("abc123"),
                        handle: "Anonymous",
                        bio: "",
                        website: "",
                        location: "",
                        imageUrl: "",
                        reputation: 0,
                    });
                    
                    var emailSet = new Set();

                    var userData = readData(__dirname + userDataFn, 'utf-8');
                    var mappedUserData = userData.map(user => {
                        var nameStr = user.DisplayName.split(" ").join("").toLowerCase();
                        var email = `${nameStr}.${Math.floor(Math.random() * 100000)}@gmail.com`;
                        
                        while (emailSet.has(email)) {
                            email = `${nameStr}.${Math.floor(Math.random() * 100000)}@gmail.com`;
                        }

                        emailSet.add(email);

                        return ({
                            id: parseInt(user.Id, 10),
                            email: email,
                            password: hash(nameStr),
                            handle: user.DisplayName,
                            bio: user.AboutMe,
                            website: user.WebsiteUrl,
                            location: user.Location,
                            imageUrl: user.ProfileImageUrl,
                            reputation: parseInt(user.Reputation, 10),
                        })
                    })
                    
                    var otherUserData = readData(__dirname + otherUserDataFn, 'utf-8');
                    var hashedPasswords = fs.readFileSync("./data/hashed_passwords.txt", 'utf-8').split("\n");

                    var mappedOtherUserData = otherUserData.map((otherUser, i) => {
                        var nameStr = otherUser.DisplayName.split(" ").join("").toLowerCase();

                        var email = `${nameStr}.${Math.floor(Math.random() * 100000)}@gmail.com`;
                        
                        while (emailSet.has(email)) {
                            email = `${nameStr}.${Math.floor(Math.random() * 100000)}@gmail.com`;
                        }
                        
                        emailSet.add(email);

                        return ({
                            id: parseInt(otherUser.Id, 10),
                            email: email,
                            password: hashedPasswords[i],
                            handle: otherUser.DisplayName,
                            bio: otherUser.AboutMe,
                            website: otherUser.WebsiteUrl,
                            location: otherUser.Location,
                            imageUrl: otherUser.ProfileImageUrl,
                            reputation: parseInt(otherUser.Reputation, 10),
                        })
                    })
                    
                    return Promise.all([
                        anonUserCreate,
                        User.bulkCreate(mappedUserData),
                        User.bulkCreate(mappedOtherUserData),
                    ])
                }
            })
    )
}

function populatePosts() {
    var postDataFn = "/data/posts_by_top_100_users.csv"
    return (
        Thread.count()
            .then(threadCount => {
                if (threadCount == 0) {
                    console.log("Populating Posts");
                    var postData = readData(__dirname + postDataFn, 'utf-8');
                    var set = new Set();

                    var mappedPostData = postData.filter(post => {
                        if (!set.has(post.Id)) {
                            set.add(post.Id);
                            return true;
                        }
                        else {
                            return false;
                        }
                    }).map(post => {
                        return ({
                            id: parseInt(post.Id, 10),
                            title: post.Title,
                            text: post.Body,
                            createdAt: post.CreationDate,
                            updatedAt: post.LastEditDate,
                            userId: parseInt(post.OwnerUserId, 10),
                        })
                    })

                    return Thread.bulkCreate(mappedPostData)
                }
            })
    )
}

function populateComments() {
    var commentDataFn = "/data/comments_of_posts_by_top_100_users.csv"
    return (
        Comment.count()
            .then(commentCount => {
                if (commentCount == 0) {
                    console.log("Populating Comments");

                    var commentData = jqCsv.toObjects(fs.readFileSync(__dirname + commentDataFn, 'utf-8'));
                    return (
                        User.findOne({
                            where: {
                                email: "anonymous@email.com"
                            }
                        })
                            .then(anonUser => {
                                var mappedCommentData = (
                                    commentData.map(comment => {
                                        return ({
                                            id: parseInt(comment.Id, 10),
                                            text: comment.Body,
                                            createdAt: comment.CreationDate,
                                            threadId: parseInt(comment.ParentId, 10),
                                            userId: (comment.OwnerUserId.length == 0) ? anonUser.id : parseInt(comment.OwnerUserId, 10),
                                        })
                                    })
                                )
                                
                                return Comment.bulkCreate(mappedCommentData)
                            })
                    )
                }
            })
    )
}

function populateVotes() {
    return (
        Vote.count()
            .then(voteCount => {
                if (voteCount == 0) {
                    console.log("Populating Votes");
                    return (
                        User.findAll()
                            .then(users => {
                                return (
                                    Promise.all(users.map(user => {
                                        if (user.id == null) {
                                            console.log(user);
                                        }
                                        return (
                                            findRandom(Thread, Math.ceil(Math.random() * 20))
                                                .then(posts => {
                                                    var votes = posts.map(post => ({
                                                        userId: user.id,
                                                        threadId: post.id,
                                                    }))
                                                    
                                                    return Vote.bulkCreate(votes);
                                                })
                                        )
                                    }))
                                )
                            })
                    )
                }
            })
    )
}

function populate() {
    populateUsers()
        .then(populatePosts)
        .then(populateComments)
        .then(populateVotes)
        .then(() => console.log("Finished populating."))
}

module.exports = populate;