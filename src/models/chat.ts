import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import type {
  ChatFileType,
  ChatStatusType,
} from 'src/interfaces/model.interface';

export interface ChatAttributes {
  id: number;
  senderId: string;
  roomId: number;
  message?: string;
  file?: string;
  fileId?: string;
  fileType?: ChatFileType;
  isRead: boolean;
  status: ChatStatusType;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<ChatAttributes, ChatAttributes>>({
  tableName: 'Chats',
  modelName: 'Chats',
})
export class Chat
  extends Model<ChatAttributes, ChatAttributes>
  implements ChatAttributes
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
  public senderId: string;

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
    type: DataTypes.STRING,
    allowNull: true,
  })
  public message?: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  public file?: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  public fileId?: string;

  @Column({
    type: DataTypes.ENUM,
    allowNull: true,
    values: ['image', 'video', 'document', 'audio'],
  })
  public fileType?: ChatFileType;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  public isRead: boolean;

  @Column({
    type: DataTypes.ENUM,
    values: ['plain', 'updated', 'deleted'],
    defaultValue: 'plain',
  })
  public status: ChatStatusType;

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
