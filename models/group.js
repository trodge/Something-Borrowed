module.exports = function(sequelize, DataTypes) {
    let Group = sequelize.define('Group', {
      name: {      
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1]
        }}
    });
    // Group.associate = function(models) {
    //   Group.hasMany(models.User, {
    //   });
    // };
    return Group;
  };
  