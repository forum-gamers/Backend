import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface UserAchievementAttributes {
  id: number;
  achievementId: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<UserAchievementAttributes, UserAchievementAttributes>>({
  tableName: 'UserAchievements',
  modelName: 'UserAchievements',
})
export class UserAchievement
  extends Model<UserAchievementAttributes, UserAchievementAttributes>
  implements UserAchievementAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    type: DataTypes.INTEGER,
    references: {
      model: {
        tableName: 'Achievements',
      },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'achievementId is required',
      },
      notNull: {
        msg: 'achievementId is required',
      },
    },
  })
  public achievementId: number;

  @Column({
    type: DataTypes.UUID,
    references: {
      model: {
        tableName: 'Users',
      },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    validate: {
      notNull: {
        msg: 'userId is required',
      },
      notEmpty: {
        msg: 'userId is required',
      },
    },
    allowNull: false,
  })
  public userId: string;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public updatedAt: Date;
}
