import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface PostMediaAttributes {
  id: number;
  postId: number;
  url: string;
  fileId: string;
  type: 'image' | 'video';
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<PostMediaAttributes, PostMediaAttributes>>({
  modelName: 'PostMedia',
  tableName: 'PostMedia',
})
export class PostMedia
  extends Model<PostMediaAttributes, PostMediaAttributes>
  implements PostMediaAttributes
{
  @Column({
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  })
  public id: number;

  @Column({
    type: DataTypes.ENUM,
    values: ['image', 'video'],
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'type is required',
      },
      notNull: {
        msg: 'type is required',
      },
    },
  })
  public type: 'image' | 'video';

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'url is required',
      },
      notNull: {
        msg: 'url is required',
      },
    },
  })
  public url: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'fileId is required',
      },
      notNull: {
        msg: 'fileId is required',
      },
    },
  })
  public fileId: string;

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
}
