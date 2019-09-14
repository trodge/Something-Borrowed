module.exports = function (sequelize, DataTypes) {
    let UserGroup = sequelize.define('UserGroup', {
        isAdmin: {
            type: DataTypes.BOOLEAN
        }
    });
    return UserGroup;
};
