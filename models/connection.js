module.exports = function (sequelize, type) {
    var connection = sequelize.define('connection', {
        accepted: {
            type: type.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    })
}