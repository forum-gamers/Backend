import { DataTypes } from 'sequelize';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import { User } from './user';

export interface FollowAttributes {
  id: number;
  followerId: string;
  followedId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<FollowAttributes, FollowAttributes>>({
  tableName: 'Follows',
  modelName: 'Follows',
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followedId'],
    },
  ],
})
export class Follow
  extends Model<FollowAttributes, FollowAttributes>
  implements FollowAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

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
  public followerId: string;

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
  public followedId: string;

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

  @BelongsTo(() => User, 'followerId')
  public follower: User;

  @BelongsTo(() => User, 'followedId')
  public followed: User;
}
