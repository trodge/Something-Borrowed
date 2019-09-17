module.exports = function (sequelize, DataTypes) {
    let GroupRequest = sequelize.define('GroupRequest', {
        groupRequestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        groupId: {type: DataTypes.INTEGER, allowNull: false},
        userIdToken: {type: DataTypes.String, allowNull: false},
        status: {type: DataTypes.String}
    });
    GroupRequest.associate = function (models) {
        GroupRequest.belongsTo(models.Group, {foreignKey: 'groupId'});
        GroupRequest.belongsTo(models.User, {foreignKey: 'userIdToken'});
    };
    return GroupRequest;
};