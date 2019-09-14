module.exports = function (sequelize, DataTypes) {
    let Item = sequelize.define('Item', {
        itemName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        itemImage: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: [1]
            }
        },
        itemDescription: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        itemCategory: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Miscellaneous',
            validate: {
                len: [1]
            }
        },
        groupAvailableTo: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Public',
            validate: {
                len: [1]
            }
        },
        userIdToken: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Item.associate = function (models) {
        Item.belongsTo(models.User, {
            foreignKey: 'userIdToken'
        });
    };
    return Item;
};