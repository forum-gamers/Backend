import { DataTypes } from 'sequelize';
import { BelongsTo, Column, Model, Table } from 'sequelize-typescript';
import { Post } from './post';

export interface PostBookmarkAttributes {
  id: number;
  postId: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<PostBookmarkAttributes, PostBookmarkAttributes>>({
  modelName: 'PostBookmarks',
  tableName: 'PostBookmarks',
})
export class PostBookmark
  extends Model<PostBookmarkAttributes, PostBookmarkAttributes>
  implements PostBookmarkAttributes
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
}
