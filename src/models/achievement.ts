import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface AchievementAttributes {
  id: number;
  name: string;
  description?: string;
  imageUrl: string;
  imageId: string;
  gameId?: number | null;
  communityId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<AchievementAttributes, AchievementAttributes>>({
  tableName: 'Achievements',
  modelName: 'Achievements',
})
export class Achievement
  extends Model<AchievementAttributes, AchievementAttributes>
  implements AchievementAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'name is required',
      },
      notNull: {
        msg: 'name is required',
      },
    },
  })
  public name: string;

  @Column({
    type: DataTypes.TEXT,
    defaultValue: null,
    allowNull: true,
  })
  public description?: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'imageUrl is required',
      },
      notNull: {
        msg: 'imageUrl is required',
      },
    },
  })
  public imageUrl: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'imageId is required',
      },
      notNull: {
        msg: 'imageId is required',
      },
    },
  })
  public imageId: string;

  @Column({
    //can belong to any game
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: { tableName: 'Games' },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    defaultValue: null,
  })
  public gameId?: number;

  @Column({
    //can belong to any community
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: { tableName: 'Communities' },
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    defaultValue: null,
  })
  public communityId?: number;

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
