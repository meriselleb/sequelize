module.exports = (sequelize, type) => {
    return sequelize.define('vote', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
    })
}
// vote will belong to user and thread