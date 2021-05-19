module.exports = (sequelize, type) => {
    return sequelize.define('comments', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        text: type.TEXT,
        // timestamp
        createdAt: type.DATE
    })
    // belongs to user and thread
}