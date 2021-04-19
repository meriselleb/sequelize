module.exports = (sequelize, type) => {
    return sequelize.define('rank', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        title: type.STRING, // tier name: bronze, silver, gold
        text: type.STRING, // description
        minimumPoints: type.INTEGER, // points
        maximumPoints: type.INTEGER
    })
}