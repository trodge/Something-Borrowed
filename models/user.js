module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define('User', {
        userIdToken: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            validate: {
                len: [1]
            }
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        userEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        userImage: {
            type: DataTypes.STRING,
            defaultValue: 'random.jpg',
            validate: {
                len: [1]
            }
        }
    });
    User.associate = function (models) {
        User.hasMany(models.Item, {
            foreignKey: 'userIdToken',
            onDelete: 'cascade'
        });
        User.belongsToMany(models.Group, {
            through: 'UserGroup', 
            foreignKey: 'userIdToken'
        });
    };
    return User;
};
