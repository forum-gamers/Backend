import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface GameAttributes {
  id: number;
  name: string;
  code: string;
  imageUrl: string;
  imageId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<GameAttributes, GameAttributes>>({
  tableName: 'Games',
  modelName: 'Games',
})
export class Game
  extends Model<GameAttributes, GameAttributes>
  implements GameAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'name is required',
      },
      notNull: {
        msg: 'name is required',
      },
    },
    unique: true,
  })
  public name: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        msg: 'code is required',
      },
      notNull: {
        msg: 'code is required',
      },
    },
    unique: true,
  })
  public code: string;

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
