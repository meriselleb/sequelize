module.exports = (sequelize, type) => {
    return sequelize.define('notification', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        kind: type.STRING, // kind: friend request, earned badge, comment on post
        // time stamps
        createdAt: type.DATE,
        updatedAt: type.DATE,
    })
}