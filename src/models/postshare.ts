import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface PostShareAttributes {
  id: number;
  postId: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<PostShareAttributes, PostShareAttributes>>({
  modelName: 'PostShares',
  tableName: 'PostShares',
})
export class PostShare
  extends Model<PostShareAttributes, PostShareAttributes>
  implements PostShareAttributes
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
}
