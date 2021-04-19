module.exports = (sequelize, Sequelize) => {
    return sequelize.define('user', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: Sequelize.STRING,
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          }
        },
        header: Sequelize.STRING,
        description: Sequelize.STRING,
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        }
    })
}