import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface TeamAchievementAttribute {
  id: number;
  achievementId: number;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<TeamAchievementAttribute, TeamAchievementAttribute>>({
  tableName: 'TeamAchievements',
  modelName: 'TeamAchievements',
})
export class TeamAchievement
  extends Model<TeamAchievementAttribute, TeamAchievementAttribute>
  implements TeamAchievementAttribute
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
        tableName: 'Teams',
      },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL',
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'teamId is required',
      },
      notNull: {
        msg: 'teamId is required',
      },
    },
  })
  public teamId: string;

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
