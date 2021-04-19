module.exports = (sequelize, type) => {
    return sequelize.define('comments', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        text: type.STRING,
        // timestamp
        createdAt: type.DATE
    })
    // belongs to user and thread
}