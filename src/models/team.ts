import { DataTypes } from 'sequelize';
import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { TeamMember } from './teammember';

export interface TeamAttributes {
  id: string;
  name: string;
  owner: string;
  imageUrl?: string;
  imageId?: string;
  description?: string;
  gameId: number;
  totalMember: number;
  isPublic: boolean;
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
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: {
        tableName: 'Games',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    validate: {
      notEmpty: {
        msg: 'gameId cannot be empty',
      },
      notNull: {
        msg: 'gameId cannot be empty',
      },
    },
  })
  public gameId: number;

  @Column({
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    validate: {
      notEmpty: {
        msg: 'isPublic cannot be empty',
      },
      notNull: {
        msg: 'isPublic cannot be empty',
      },
    },
  })
  public isPublic: boolean;

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

  @HasMany(() => TeamMember, 'teamId')
  public members: TeamMember[];
}
