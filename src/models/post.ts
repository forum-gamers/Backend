import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';
import type { PostPrivacy } from 'src/interfaces/model.interface';

export interface PostAttributes {
  id: number;
  text?: string;
  userId: string;
  allowComment: boolean;
  privacy: PostPrivacy;
  totalLike: number;
  communityId: number;
  createdAt: Date;
  updatedAt: Date;
  editedText: boolean;
  countComment: number;
  countShare: number;
  tags: string[];
}

@Table<Model<PostAttributes, PostAttributes>>({
  tableName: 'Posts',
  modelName: 'Posts',
})
export class Post
  extends Model<PostAttributes, PostAttributes>
  implements PostAttributes
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
    allowNull: true,
  })
  public text?: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  })
  public allowComment: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  public editedText: boolean;

  @Column({
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  })
  public tags: string[];

  @Column({
    type: DataTypes.ENUM,
    values: ['public', 'private', 'friend-only'],
    defaultValue: 'public',
  })
  public privacy: 'public' | 'private' | 'friend-only';

  @Column({
    type: DataTypes.BIGINT,
    defaultValue: 0,
  })
  public totalLike: number;

  @Column({
    type: DataTypes.BIGINT,
    defaultValue: 0,
  })
  public countComment: number;

  @Column({
    type: DataTypes.BIGINT,
    defaultValue: 0,
  })
  public countShare: number;

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
    allowNull: true,
    type: DataTypes.INTEGER,
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
}
