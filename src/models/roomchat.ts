import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import type { RoomChatType } from 'src/interfaces/model.interface';

export interface RoomChatAttributes {
  id: number;
  owner: string;
  name?: string;
  image?: string;
  imageId?: string;
  description?: string;
  type: RoomChatType;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<RoomChatAttributes, RoomChatAttributes>>({
  tableName: 'RoomChats',
  modelName: 'RoomChats',
})
export class RoomChat
  extends Model<RoomChatAttributes, RoomChatAttributes>
  implements RoomChatAttributes
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
  public owner: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  public name?: string;

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
  public image?: string;

  @Column({
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true,
  })
  public imageId?: string;

  @Column({
    type: DataTypes.ENUM,
    values: ['private', 'group'],
    defaultValue: 'private',
  })
  public type: RoomChatType;

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
