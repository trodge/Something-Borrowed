module.exports = function (sequelize, DataTypes) {
    let Group = sequelize.define('Group', {
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        groupName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        groupDescription: {
            type: DataTypes.STRING
        }
    });
    Group.associate = function (models) {
        Group.belongsToMany(models.User, { through: models.UserGroup });
        Group.belongsToMany(models.Item, { through: 'ItemGroup' });
    };
    return Group;
};
