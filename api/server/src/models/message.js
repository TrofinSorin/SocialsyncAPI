module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    createdAt: DataTypes.DATE,
    fromUserId: DataTypes.INTEGER,
    readAt: DataTypes.DATE,
    from: DataTypes.STRING,
    username: DataTypes.STRING,
    status: DataTypes.ARRAY(DataTypes.TEXT),
    text: DataTypes.STRING,
    thumb: DataTypes.BOOLEAN,
    toUserId: DataTypes.INTEGER,
    updatedAt: DataTypes.DATE
  }, {
    timestamps: true,
    underscored: true,
  });
  return Message;
};
