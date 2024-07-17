import { DataTypes } from 'sequelize';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import type { CommunityMemberRole } from 'src/interfaces/model.interface';
import { User } from './user';

export interface CommunityMembersAttributes {
  id: number;
  userId: string;
  communityId: number;
  createdAt: Date;
  updatedAt: Date;
  role: CommunityMemberRole;
}

@Table<Model<CommunityMembersAttributes, CommunityMembersAttributes>>({
  tableName: 'CommunityMembers',
  modelName: 'CommunityMembers',
})
export class CommunityMembers
  extends Model<CommunityMembersAttributes, CommunityMembersAttributes>
  implements CommunityMembersAttributes
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
  public userId: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: {
        tableName: 'Communities',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public communityId: number;

  @Column({
    type: DataTypes.ENUM,
    values: ['admin', 'member', 'owner'],
    defaultValue: 'member',
  })
  public role: CommunityMemberRole;

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

  @BelongsTo(() => User, 'userId')
  public user: User;
}
