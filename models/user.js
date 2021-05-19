module.exports = (sequelize, Sequelize) => {
  return sequelize.define('user', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    handle: Sequelize.STRING,
    bio: Sequelize.TEXT,
    website: Sequelize.STRING,
    location: Sequelize.STRING,
    imageUrl: Sequelize.STRING,
    reputation: Sequelize.INTEGER,
  }, {
    initialAutoIncrement: 1,
  })
}