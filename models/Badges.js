module.exports = (sequelize, type) => {
    return sequelize.define('badges', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        title: type.STRING,
        description: type.STRING
    })
    // belongs to many users
    // attach png
}