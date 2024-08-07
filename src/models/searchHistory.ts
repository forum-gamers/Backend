import { DataTypes } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

export interface SearchHistoryAttributes {
  id: number;
  userId: string;
  searchedText: string;
  createdAt: Date;
  updatedAt: Date;
}

@Table<Model<SearchHistoryAttributes, SearchHistoryAttributes>>({
  tableName: 'SearchHistories',
  modelName: 'SearchHistories',
})
export class SearchHistory
  extends Model<SearchHistoryAttributes, SearchHistoryAttributes>
  implements SearchHistoryAttributes
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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'searchedText is required',
      },
      notNull: {
        msg: 'searchedText is required',
      },
    },
  })
  public searchedText: string;

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
