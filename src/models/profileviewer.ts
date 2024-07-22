import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface ProfileViewerAttributes {
  id: number;
  targetId: string;
  viewerId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<ProfileViewerAttributes, ProfileViewerAttributes>>({
  tableName: 'ProfileViewers',
  modelName: 'ProfileViewers',
})
export class ProfileViewers
  extends Model<ProfileViewerAttributes, ProfileViewerAttributes>
  implements ProfileViewerAttributes
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
  public targetId: string;

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
  public viewerId: string;

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
