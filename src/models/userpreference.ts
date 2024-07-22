import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface UserPreferenceAttributes {
  id: number;
  userId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<UserPreferenceAttributes, UserPreferenceAttributes>>({
  modelName: 'UserPreferences',
  tableName: 'UserPreferences',
})
export class UserPreferences
  extends Model<UserPreferenceAttributes, UserPreferenceAttributes>
  implements UserPreferenceAttributes
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
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  })
  public tags: string[];

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
