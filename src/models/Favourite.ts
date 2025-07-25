import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Service from './Service';

class Favourite extends Model {
  public id!: number;
  public user_id!: number;
  public service_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favourite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'favourites',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Favourite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favourite.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

User.hasMany(Favourite, { foreignKey: 'user_id', as: 'favourites' });
Service.hasMany(Favourite, { foreignKey: 'service_id', as: 'favourites' });

export default Favourite; 