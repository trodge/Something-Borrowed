module.exports = (sequelize, DataTypes) => {
    let GroupRequest = sequelize.define('GroupRequest', {
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        groupId: {type: DataTypes.INTEGER, allowNull: false},
        userIdToken: {type: DataTypes.String, allowNull: false}
    });
    GroupRequest.associate = models => {
        GroupRequest.belongsTo(models.Group, {foreignKey: 'groupId'});
        GroupRequest.belongsTo(models.User, {foreignKey: 'userIdToken'});
    };
    return GroupRequest;
};