import { DataTypes } from 'sequelize';
import { BelongsTo, Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Post } from './post';
import { ReplyComment } from './replycomment';

export interface PostCommentAttributes {
  id: number;
  postId: number;
  userId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<PostCommentAttributes, PostCommentAttributes>>({
  modelName: 'PostComments',
  tableName: 'PostComments',
})
export class PostComment
  extends Model<PostCommentAttributes, PostCommentAttributes>
  implements PostCommentAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: {
        tableName: 'Posts',
      },
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public postId: number;

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
    allowNull: false,
    type: DataTypes.DATE,
  })
  public createdAt: Date;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  public updatedAt: Date;

  @BelongsTo(() => Post, 'postId')
  public post: Post;

  @HasMany(() => ReplyComment, 'commentId')
  public replies: ReplyComment[];
}
