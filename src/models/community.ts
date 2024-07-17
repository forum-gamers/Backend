import { DataTypes } from 'sequelize';
import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { CommunityMembers } from './communitymember';

export interface CommunityAttributes {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  imageId?: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<CommunityAttributes, CommunityAttributes>>({
  tableName: 'Communities',
  modelName: 'Communities',
})
export class Community
  extends Model<CommunityAttributes, CommunityAttributes>
  implements CommunityAttributes
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
    defaultValue: null,
    allowNull: true,
  })
  public imageUrl?: string;

  @Column({
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  })
  public imageId?: string;

  @Column({
    type: DataTypes.UUID,
    allowNull: false,
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
    allowNull: false,
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public updatedAt: Date;

  @HasMany(() => CommunityMembers, 'communityId')
  public members: CommunityMembers[];
}
