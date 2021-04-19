module.exports = function (sequelize, type) {
    var availableConnection = sequelize.define('availableConnection', {
        accepted: {
            type: type.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    })
}