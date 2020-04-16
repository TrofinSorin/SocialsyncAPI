module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    confirmpassword: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    avatar: DataTypes.STRING,
    lastlogin: DataTypes.DATE
  }, {
    timestamps: false,
    underscored: true,
  });
  return User;
};
