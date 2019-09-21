module.exports = function (sequelize, DataTypes) {
    let ItemRequest = sequelize.define('ItemRequest', {
        owner: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        requester: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        requesterName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        item: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        }
    });
    ItemRequest.associate = function (models) {
        ItemRequest.belongsTo(models.User, {foreignKey: 'owner'});
        ItemRequest.belongsTo(models.User, {foreignKey: 'requester'});
    };
    return ItemRequest;
};
