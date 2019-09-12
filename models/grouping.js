module.exports = function (sequelize, DataTypes) {
    let Group = sequelize.define('Grouping', {
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
        groupAdmin: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        }
    });
    Group.associate = function(models) {
      Group.hasMany(models.User, {
          foreignKey: 'groupId'
      });
    };
    return Group;
};
