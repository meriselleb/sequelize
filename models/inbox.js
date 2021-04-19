module.exports = (sequelize, type) => {
    return sequelize.define('inbox', {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        content: type.STRING,
        //time stamps
        createdAt: type.DATE,
        sendTo: type.INTEGER,
        sendFrom: type.INTEGER
    })
    // belong to two users
    // look up how to do two different ids from one user table
}