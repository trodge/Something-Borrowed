module.exports = function(sequelize, DataTypes) {
    let Item = sequelize.define('Item', {
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      itemCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      },
      groupAvailableTo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }
      }
    });
    // Item.associate = function(models) {
    //     Item.belongsTo(models.User, {
    //       foreignKey: {
    //         allowNull: false
    //       }
    //     });
    //   };
    return Item;
  };