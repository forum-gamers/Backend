import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface ReplyCommentAttributes {
  id: number;
  commentId: number;
  userId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<ReplyCommentAttributes, ReplyCommentAttributes>>({
  modelName: 'ReplyComments',
  tableName: 'ReplyComments',
})
export class ReplyComment
  extends Model<ReplyCommentAttributes, ReplyCommentAttributes>
  implements ReplyCommentAttributes
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
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'text is required',
      },
      notNull: {
        msg: 'text is required',
      },
    },
  })
  public text: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: {
        tableName: 'Comments',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public commentId: number;

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
