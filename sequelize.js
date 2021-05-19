const Sequelize = require('sequelize')
const UserModel = require('./models/user')
const BlogModel = require('./models/blog')
const TagModel = require('./models/tag')
const ThreadModel = require('./models/threads')
const BadgeModel = require('./models/Badges')
const CommentModel = require('./models/comments')
const InboxModel = require('./models/inbox')
const VoteModel = require('./models/vote')
const RankModel = require('./models/rank')
const availableConnectionsModel = require('./models/availableConnection')
const ConnectionModel = require('./models/connection')
const config = require('./config.json')[process.env.NODE_ENV || "development"]
const NotificationModel = require('./models/notifications')

const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: false,
})

const User = UserModel(sequelize, Sequelize)
const BlogTag = sequelize.define('blog_tag', {})
const Blog = BlogModel(sequelize, Sequelize)
const Tag = TagModel(sequelize, Sequelize)

const BadgeTag = sequelize.define('user_bagdes', {})
const RankTag = sequelize.define('user_ranks', {})
const ConnectionRequests = sequelize.define('connection_requests', {})

const Inbox = InboxModel(sequelize, Sequelize)
const Vote = VoteModel(sequelize, Sequelize)
const Comment = CommentModel(sequelize, Sequelize)
const Badge = BadgeModel(sequelize, Sequelize)
const Thread = ThreadModel(sequelize, Sequelize)
const availableConnection = availableConnectionsModel(sequelize, Sequelize)
const Rank = RankModel(sequelize, Sequelize)
const Connections = ConnectionModel(sequelize, Sequelize)
const Notifications = NotificationModel(sequelize, Sequelize)

Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
Blog.belongsTo(User);

//linking 

Vote.belongsTo(Thread);
Vote.belongsTo(User);
Thread.hasMany(Vote);
User.hasMany(Vote);

Rank.belongsToMany(User, { through: RankTag, unique: false })
User.belongsToMany(Rank, { through: RankTag, unique: false })

Comment.belongsTo(Thread);
Comment.belongsTo(User);
User.hasMany(Comment);
Thread.hasMany(Comment)

Thread.belongsTo(User);
User.hasMany(Thread);

Badge.belongsToMany(User, { through: BadgeTag, unique: false })
User.belongsToMany(Badge, { through: BadgeTag, unique: false })

User.belongsToMany(User, { through: Connections, as: 'connectionFrom', foreignKey: 'fromUserId'});
User.belongsToMany(User, { through: Connections, as: 'connectionTo', foreignKey: 'toUserId'});

User.belongsToMany(User, { through: ConnectionRequests, as: 'requestFrom', foreignKey: 'fromUserId'});
User.belongsToMany(User, { through: ConnectionRequests, as: 'requestTo', foreignKey: 'toUserId'});

Notifications.belongsTo(User);

// Inbox later


// Connections
// Available Connections Later

module.exports = {
    User,
    Blog,
    Tag,
    Rank,
    Thread,
    Vote,
    Inbox,
    Comment,
    Connections,
    availableConnection,
    sequelize,
    Notifications
}