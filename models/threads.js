module.exports = (sequelize, type) => {
    return sequelize.define('thread', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        title: type.STRING,
        text: type.STRING,
        // time stamps
        createdAt: type.DATE,
        updatedAt: type.DATE,
        // vote will be a belong to
    })
}