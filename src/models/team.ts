import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface TeamAttributes {
  id: string;
  name: string;
  owner: string;
  imageUrl?: string;
  imageId?: string;
  description?: string;
  totalMember: number;
  maxMember: number;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<TeamAttributes, TeamAttributes>>({
  tableName: 'Teams',
  modelName: 'Teams',
})
export class Team
  extends Model<TeamAttributes, TeamAttributes>
  implements TeamAttributes
{
  @Column({
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  })
  public id: string;

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
    type: DataTypes.UUID,
    references: {
      model: {
        tableName: 'Users',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public owner: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  public imageUrl?: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  public imageId?: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  public description?: string;

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

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
  })
  public totalMember: number;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 10,
  })
  public maxMember: number;
}
