import { DataTypes } from 'sequelize';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import type { RoomMemberType } from 'src/interfaces/model.interface';
import { RoomChat } from './roomchat';

export interface RoomMemberAttributes {
  id: number;
  userId: string;
  roomId: number;
  createdAt: Date;
  updatedAt: Date;
  role: RoomMemberType;
}

@Table<Model<RoomMemberAttributes, RoomMemberAttributes>>({
  tableName: 'RoomMembers',
  modelName: 'RoomMembers',
})
export class RoomMember
  extends Model<RoomMemberAttributes, RoomMemberAttributes>
  implements RoomMemberAttributes
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
        tableName: 'RoomChats',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public roomId: number;

  @Column({
    type: DataTypes.ENUM,
    values: ['admin', 'member', 'owner'],
    defaultValue: 'member',
  })
  public role: RoomMemberType;

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

  @BelongsTo(() => RoomChat, 'roomId')
  public roomChat: RoomChat;
}
